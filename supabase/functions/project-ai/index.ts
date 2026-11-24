
import { createClient } from "npm:@supabase/supabase-js@2";

// Supported Groq model.
// You can override this through the GROQ_MODEL Supabase secret.
const MODEL = Deno.env.get("GROQ_MODEL") || "openai/gpt-oss-20b";

const GROQ_CHAT_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin":
    Deno.env.get("ALLOWED_ORIGIN") || "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

const json = (
  status: number,
  body: Record<string, unknown>
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });

const MODES: Record<string, string> = {
  ideas:
    "Generate practical project ideas. Explain the problem, target users, differentiator, MVP, feasibility and risks.",

  validate:
    "Validate the idea. Assess problem-solution fit, target users, alternatives, feasibility, risks and validation experiments.",

  improve:
    "Rewrite and improve the project description. Preserve the intended idea and make it clear, specific and compelling.",

  roadmap:
    "Create a realistic phased roadmap with milestones, deliverables, dependencies, estimated effort and risks.",

  stack:
    "Recommend a suitable technology stack. Explain choices, alternatives, trade-offs, security and deployment.",

  review:
    "Review the project critically. Identify strengths, gaps, technical risks, security concerns and prioritized improvements.",

  features:
    "Suggest prioritized MVP, next-release and later-stage features. Avoid unnecessary scope and feature creep.",

  readme:
    "Generate a GitHub README with overview, problem, features, architecture, prerequisites, setup, configuration, usage and contribution guidance.",
};

function getBearerToken(req: Request): string | null {
  const header = req.headers.get("Authorization");

  if (!header) return null;

  const match = header.match(/^Bearer\s+(.+)$/i);

  return match?.[1]?.trim() || null;
}

function getProviderError(body: any, status: number): string {
  if (status === 401 || status === 403) {
    return "Groq rejected the API key. Verify GROQ_API_KEY in Supabase secrets.";
  }

  if (status === 404) {
    return `Groq could not find model "${MODEL}". Check the model ID in Groq Console.`;
  }

  if (status === 429) {
    return "Groq rate limit or quota reached. Wait and retry, or check your Groq usage limits.";
  }

  const message = body?.error?.message || body?.message;

  if (typeof message === "string" && message.length < 500) {
    return message;
  }

  return `Groq returned HTTP ${status}. Check Edge Function logs.`;
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return json(405, {
      error: "Method not allowed. Send a POST request.",
    });
  }

  try {
    // Environment configuration
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    const supabaseAnonKey =
      Deno.env.get("SUPABASE_ANON_KEY") ||
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

    const groqApiKey = Deno.env.get("GROQ_API_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment configuration.");

      return json(500, {
        error: "Supabase function environment is not configured correctly.",
      });
    }

    if (!groqApiKey) {
      console.error("GROQ_API_KEY is missing.");

      return json(500, {
        error: "GROQ_API_KEY is missing from Supabase Edge Function secrets.",
      });
    }

    // Authenticate user
    const accessToken = getBearerToken(req);

    if (!accessToken) {
      return json(401, {
        error: "Authorization header is missing. Sign in to Aspira and retry.",
      });
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const {
      data: userData,
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !userData?.user) {
      console.error(
        "User authentication failed:",
        authError?.message
      );

      return json(401, {
        error: "Your Aspira session is invalid or expired. Sign in again.",
      });
    }

    // Parse request
    let payload: any;

    try {
      payload = await req.json();
    } catch {
      return json(400, {
        error: "Request body must contain valid JSON.",
      });
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      return json(400, {
        error: "A valid JSON object is required.",
      });
    }

    const mode = String(payload.mode || "ideas").trim();

    const prompt = String(
      payload.prompt || ""
    ).trim();

    const context = String(
      payload.context || "Aspira project community"
    ).trim();

    if (!Object.hasOwn(MODES, mode)) {
      return json(400, {
        error: "Unsupported AI mode.",
      });
    }

    if (!prompt) {
      return json(400, {
        error: "Enter a project idea or description before generating.",
      });
    }

    if (prompt.length > 12000) {
      return json(413, {
        error: "Prompt is too long. Keep it under 12,000 characters.",
      });
    }

    if (context.length > 3000) {
      return json(413, {
        error: "Project context is too long. Keep it under 3,000 characters.",
      });
    }

    // Call Groq
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 50000);

    let groqResponse: Response;

    try {
      groqResponse = await fetch(GROQ_CHAT_URL, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          model: MODEL,
          temperature: 0.4,
          max_completion_tokens: 1800,

          messages: [
            {
              role: "system",

              content: [
                "You are Aspira's project strategy and engineering assistant.",
                MODES[mode],
                `Context: ${context}`,
                "Be practical, specific, structured and honest.",
                "Do not invent facts, prices, citations or guarantees.",
                "Clearly label assumptions.",
                "Flag security, privacy, legal and feasibility risks where relevant.",
                "Use Markdown headings and lists when they improve readability.",
              ].join("\n\n"),
            },

            {
              role: "user",
              content: prompt,
            },
          ],
        }),

        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const groqBody = await groqResponse
      .json()
      .catch(() => null);

    // Handle provider errors
    if (!groqResponse.ok) {
      const providerMessage = getProviderError(
        groqBody,
        groqResponse.status
      );

      console.error("Groq request failed:", {
        status: groqResponse.status,
        model: MODEL,
        message: providerMessage,
        userId: userData.user.id,
      });

      const responseStatus =
        groqResponse.status === 429 ? 429 : 502;

      return json(responseStatus, {
        error: providerMessage,
        model: MODEL,
      });
    }

    // Extract AI response
    const result =
      groqBody?.choices?.[0]?.message?.content;

    if (
      typeof result !== "string" ||
      !result.trim()
    ) {
      console.error("Groq returned an empty response.", {
        model: MODEL,
        userId: userData.user.id,
      });

      return json(502, {
        error: "The AI model returned an empty response. Please retry.",
      });
    }

    // Success
    return json(200, {
      result: result.trim(),
      mode,
      model: MODEL,
    });

  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected server error.";

    console.error("project-ai function error:", message);

    if (
      error instanceof Error &&
      (
        error.name === "AbortError" ||
        message.toLowerCase().includes("abort")
      )
    ) {
      return json(504, {
        error: "The AI provider timed out. Please retry.",
      });
    }

    return json(500, {
      error: "The project AI service encountered an internal error.",
    });
  }
});

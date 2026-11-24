import { supabase } from "./supabase.js";

export const ASPIRA_ROLES = ["personal", "investor", "sponsor"];

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function getCurrentProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, organization, role, profile_completed, verification_status, profile_details")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function resolveAuthDestination(user) {
  if (!user) return "/login";

  const profile = await getCurrentProfile(user.id);

  if (
    !profile ||
    profile.profile_completed !== true ||
    !ASPIRA_ROLES.includes(profile.role)
  ) {
    return "/complete-profile";
  }

  return "/home";
}

export function validateProfile(role, values) {
  const common = ["full_name", "phone", "organization"];

  const requiredByRole = {
    personal: ["member_type", "skills_interests", "purpose"],
    investor: [
      "investor_type",
      "investment_range",
      "preferred_industries",
      "investment_objectives"
    ],
    sponsor: [
      "designation",
      "project_name",
      "project_description",
      "funding_required",
      "funding_purpose",
      "project_stage"
    ]
  };

  if (!ASPIRA_ROLES.includes(role)) {
    return "Select a valid account type.";
  }

  for (const key of [...common, ...requiredByRole[role]]) {
    if (!String(values[key] ?? "").trim()) {
      return `${key.replaceAll("_", " ")} is required.`;
    }
  }

  if (
    !/^\+?[1-9]\d{7,14}$/.test(
      String(values.phone).replace(/[\s()-]/g, "")
    )
  ) {
    return "Enter a valid phone number with country code.";
  }

  if (
    role === "sponsor" &&
    (!Number.isFinite(Number(values.funding_required)) ||
      Number(values.funding_required) <= 0)
  ) {
    return "Enter a valid funding amount greater than zero.";
  }

  return "";
}

export async function submitCompletedProfile(role, values) {
  const validationError = validateProfile(role, values);

  if (validationError) {
    throw new Error(validationError);
  }

  const normalizedValues = {
    ...values,
    phone: String(values.phone).replace(/[\s()-]/g, "")
  };

  const { data, error } = await supabase.rpc("complete_aspira_profile", {
    p_role: role,
    p_profile: normalizedValues
  });

  if (error) throw error;

  if (!data?.success || data.profile_completed !== true) {
    throw new Error("The profile could not be completed. Please try again.");
  }

  return data;
}
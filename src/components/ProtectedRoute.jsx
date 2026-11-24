
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ProtectedRoute({ children }) {
  const location = useLocation();

  const [state, setState] = useState({
    loading: true,
    user: null,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const {
          data: { user },
          error
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (error) {
          setState({
            loading: false,
            user: null,
            error: error.message
          });
          return;
        }

        setState({
          loading: false,
          user: user ?? null,
          error: null
        });
      } catch (error) {
        if (!mounted) return;

        setState({
          loading: false,
          user: null,
          error: error.message || "Authentication failed."
        });
      }
    }

    loadUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      setState({
        loading: false,
        user: session?.user ?? null,
        error: null
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (state.loading) {
    return (
      <div className="route-loader">
        <div className="route-loader-mark">B</div>
        <div className="route-loader-line" />
      </div>
    );
  }

  if (!state.user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;

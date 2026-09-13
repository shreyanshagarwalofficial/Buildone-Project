import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const [state, setState] = useState({
    loading: true,
    user: null
  });

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (mounted) {
        setState({
          loading: false,
          user
        });
      }
    };

    loadUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      setState({
        loading: false,
        user: session?.user ?? null
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

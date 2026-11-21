"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/** Ni kweli tu kama umeingia kama admin kwenye kivinjari hiki. */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setIsAdmin(Boolean(data.session));
      })
      .catch(() => {});
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) setIsAdmin(Boolean(session));
      }
    );
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return isAdmin;
}

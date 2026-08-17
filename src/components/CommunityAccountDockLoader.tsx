"use client";

import { useEffect, useState } from "react";
import { CommunityAccountDock } from "@/components/ui";
import type { CommunityProfile } from "@/types/content";

type SessionState = {
  isLoggedIn: boolean;
  email: string | null;
  currentUserId: string | null;
  currentProfile: CommunityProfile | null;
};

const emptySession: SessionState = {
  isLoggedIn: false,
  email: null,
  currentUserId: null,
  currentProfile: null
};

export function CommunityAccountDockLoader({ hasSupabaseEnv }: { hasSupabaseEnv: boolean }) {
  const [session, setSession] = useState<SessionState>(emptySession);

  useEffect(() => {
    let cancelled = false;
    async function loadSession() {
      try {
        const response = await fetch("/api/community/session");
        if (!response.ok) return;
        const data = (await response.json()) as SessionState;
        if (!cancelled) setSession(data);
      } catch {
        // stil falen; dock toont dan de uitgelogde staat
      }
    }
    void loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CommunityAccountDock
      isLoggedIn={session.isLoggedIn}
      email={session.email}
      currentUserId={session.currentUserId}
      currentProfile={session.currentProfile}
      hasSupabaseEnv={hasSupabaseEnv}
    />
  );
}

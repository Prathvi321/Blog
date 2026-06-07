"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { syncUserProfile } from "@/app/actions/syncProfile";

export default function SyncProfile() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Proactively sync the user profile with Supabase
      syncUserProfile();
    }
  }, [isLoaded, isSignedIn]);

  return null;
}

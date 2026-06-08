"use client";

import { useEffect } from "react";
import { botIdVerifyPath } from "@/lib/botid";

const verifiedSessionKey = "botid-verified";

function alreadyVerified() {
  try {
    return sessionStorage.getItem(verifiedSessionKey) === "1";
  } catch {
    return false;
  }
}

function markVerified() {
  try {
    sessionStorage.setItem(verifiedSessionKey, "1");
  } catch {
    // Session storage may be unavailable (e.g. private mode); verifying
    // again on the next load is an acceptable fallback.
  }
}

export function BotIdVerifier() {
  useEffect(() => {
    // Verify once per session rather than on every page load so a legitimate
    // visitor does not trigger a server round-trip on each navigation.
    if (alreadyVerified()) {
      return;
    }

    const controller = new AbortController();

    void fetch(botIdVerifyPath, {
      cache: "no-store",
      credentials: "same-origin",
      method: "POST",
      signal: controller.signal,
    })
      .then(() => {
        markVerified();
      })
      .catch(() => {
        // BotID verification failures are enforced by the server endpoint.
      });

    return () => {
      controller.abort();
    };
  }, []);

  return null;
}

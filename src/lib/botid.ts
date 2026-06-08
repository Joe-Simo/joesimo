import type { initBotId } from "botid/client/core";

export const botIdVerifyPath = "/api/botid/verify";

export const botIdProtectedRoutes = [
  {
    path: botIdVerifyPath,
    method: "POST",
    advancedOptions: {
      checkLevel: "basic",
    },
  },
] satisfies Parameters<typeof initBotId>[0]["protect"];

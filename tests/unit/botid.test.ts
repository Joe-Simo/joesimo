import { describe, expect, test } from "bun:test";
import { botIdProtectedRoutes, botIdVerifyPath } from "@/lib/botid";

describe("BotID configuration", () => {
  test("protects the same route that performs server-side verification", () => {
    expect(botIdVerifyPath).toBe("/api/botid/verify");
    expect(botIdProtectedRoutes).toEqual([
      {
        path: botIdVerifyPath,
        method: "POST",
        advancedOptions: {
          checkLevel: "basic",
        },
      },
    ]);
  });
});

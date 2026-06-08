import { checkBotId } from "botid/server";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

function noContent() {
  return new Response(null, { headers: noStoreHeaders, status: 204 });
}

export async function POST() {
  // checkBotId() only has the request context it needs on Vercel. Off-Vercel
  // (local production builds, self-hosting) it throws, so short-circuit to a
  // no-op there instead of surfacing an unhandled 500. The client only fires
  // this ping on Vercel anyway, mirroring this gate.
  if (process.env.VERCEL !== "1") {
    return noContent();
  }

  try {
    const verification = await checkBotId({
      advancedOptions: {
        checkLevel: "basic",
      },
    });

    if (verification.isBot) {
      return Response.json(
        { error: "Access denied" },
        { headers: noStoreHeaders, status: 403 },
      );
    }
  } catch {
    // Fail open: a verification error must not surface as a 500 to a
    // fire-and-forget ping that ignores the response anyway.
    return noContent();
  }

  return noContent();
}

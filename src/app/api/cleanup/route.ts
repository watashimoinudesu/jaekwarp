import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    // 🔐 protect API
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const THIRTY_MIN = 30 * 60 * 1000;

    const cutoffTime = new Date(
      Date.now() - THIRTY_MIN
    ).toISOString();

    const { error } = await supabase
      .from("uploads")
      .delete()
      .eq("display_status", "done")
      .lt("created_at", cutoffTime);

    if (error) throw error;

    return Response.json({
      success: true,
    });

  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
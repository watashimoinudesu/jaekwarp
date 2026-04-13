import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

import { CAPTION_MAX_CHARS } from "@/lib/caption";
import { ensureCurrentShowing } from "@/lib/display-queue-server";
import {
  isSocialPlatform,
  sanitizeLatinHandle,
  type SocialPlatform,
} from "@/lib/social";

// 🔥 POST
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const captionRaw = formData.get("caption") as string | null;
    const caption = (captionRaw ?? "").slice(0, CAPTION_MAX_CHARS);
    const handleRaw = formData.get("social_handle") as string | null;
    const socialHandle = sanitizeLatinHandle(handleRaw ?? "");
    const platformRaw = formData.get("social_platform") as string | null;

    let socialPlatform: SocialPlatform | null = null;
    if (socialHandle && platformRaw && isSocialPlatform(platformRaw)) {
      socialPlatform = platformRaw;
    }

    const igUsernameForLegacy =
      socialPlatform === "instagram" && socialHandle ? socialHandle : null;

    if (!file) {
      return Response.json({ error: "No file" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return Response.json(
        { error: "Only image allowed" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const fileExt = file.name.split(".").pop();
    const fileName = `${randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(fileName, file, {
        contentType: file.type,
      });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

    const { data } = supabase.storage
      .from("uploads")
      .getPublicUrl(fileName);

    const imageUrl = data.publicUrl;

    const { error: insertError } = await supabase
      .from("uploads")
      .insert({
        image_url: imageUrl,
        caption: caption ?? "",
        social_platform: socialPlatform,
        social_handle: socialPlatform ? socialHandle : null,
        ig_username: igUsernameForLegacy,
        display_status: "pending",
      });

    if (insertError) {
        console.error("Inser error:", insertError);
        throw insertError;
    }

    return Response.json({ success: true, imageUrl });

  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

// 🔥 GET — คิวเดียวกับ /api/display (รองรับของเก่าที่เรียก /api/upload)
export async function GET() {
  try {
    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const row = await ensureCurrentShowing(client);
    return Response.json({
      success: true,
      data: row ? [row] : [],
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Fetch failed" }, { status: 500 });
  }
}
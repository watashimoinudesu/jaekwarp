"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import { SocialIcon } from "@/components/SocialIcon";
import {
  SOCIAL_LABEL,
  isSocialPlatform,
  socialProfileUrl,
  type SocialPlatform,
} from "@/lib/social";

type Upload = {
  id: string;
  image_url: string;
  caption: string;
  ig_username?: string | null;
  social_platform?: string | null;
  social_handle?: string | null;
  created_at: string;
};

function resolveSocial(item: Upload): {
  platform: SocialPlatform;
  handle: string;
} | null {
  const handle = (item.social_handle ?? item.ig_username ?? "").trim();
  if (!handle) return null;

  const raw = item.social_platform;
  if (raw && isSocialPlatform(raw)) {
    return { platform: raw, handle };
  }
  if (item.ig_username) {
    return { platform: "instagram", handle: item.ig_username.trim() };
  }
  return { platform: "instagram", handle };
}

export default function DisplayPage() {
  const [item, setItem] = useState<Upload | null>(null);

  const fetchLatest = async () => {
    try {
      const res = await axios.get("/api/upload");
      const latest = res.data.data?.[0];

      if (latest) {
        setItem((prev) =>
          prev?.id !== latest.id ? latest : prev
        );
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchLatest();

    const interval = setInterval(fetchLatest, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!item) {
    return (
      <div className="font-display relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 text-zinc-100">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-hero-radial"
        />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-pulse rounded-full border-2 border-violet-500/40 border-t-violet-400" />
          <p className="text-sm font-medium tracking-wide text-zinc-500">
            กำลังโหลด...
          </p>
        </div>
      </div>
    );
  }

  const social = resolveSocial(item);

  return (
    <div className="font-display relative h-dvh min-h-screen w-full overflow-hidden bg-black text-zinc-100">
      <img
        src={item.image_url}
        alt={item.caption || "รูปที่อัปโหลด"}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/40"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex max-h-[55%] flex-col justify-end px-5 pb-10 pt-8 sm:pb-12">
        <div className="pointer-events-auto mx-auto flex w-full max-w-lg flex-col gap-5">
          {item.caption ? (
            <p className="text-center text-4xl font-semibold leading-snug tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] sm:text-2xl">
              {item.caption}
            </p>
          ) : null}

          {social ? (
            <a
              href={socialProfileUrl(social.platform, social.handle)}
              target="_blank"
              rel="noopener noreferrer"
              className="group mx-auto flex w-fit max-w-full items-center gap-3 px-5 py-2.5 shadow-lg backdrop-blur-md transition hover:border-white/35 hover:bg-black/50"
            >
              <span className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-white/10 px-1 text-[#1877F2]">
                <SocialIcon
                  platform={social.platform}
                  className={
                    social.platform === "instagram"
                      ? "h-5 w-5 text-pink-300"
                      : social.platform === "facebook"
                        ? "h-7 w-7"
                        : "scale-95"
                  }
                />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  {SOCIAL_LABEL[social.platform]}
                </span>
                <span className="truncate font-mono text-4xl font-bold tracking-tight text-white">
                  
                  {social.handle}
                </span>
              </span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

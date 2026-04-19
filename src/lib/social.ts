export const SOCIAL_PLATFORMS = ["instagram", "line", "facebook"] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_LABEL: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  line: "LINE",
  facebook: "Facebook",
};

export const SOCIAL_PLACEHOLDER: Record<SocialPlatform, string> = {
  instagram: "",
  line: "",
  facebook: "",
};

export function isSocialPlatform(v: string): v is SocialPlatform {
  return (SOCIAL_PLATFORMS as readonly string[]).includes(v);
}

const HANDLE_MAX = 100;

/** อนุญาตเฉพาะ a–z A–Z 0–9 . _ - ~ (ใช้กับ LINE ID บางรูปแบบ) */
export function sanitizeLatinHandle(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9._~-]/g, "").slice(0, HANDLE_MAX);
}

/** Facebook: รองรับชื่อ/ตัวอักษรภาษาใดก็ได้ (จำกัดความยาวและอักขระที่ทำให้ path URL พัง) */
export function sanitizeFacebookHandle(raw: string): string {
  const t = raw
    .replace(/\0/g, "")
    .replace(/[\u0001-\u001F\u007F]/g, "")
    .replace(/[/\\]/g, "")
    .trim()
    .slice(0, HANDLE_MAX);
  return t;
}

export function sanitizeSocialHandle(
  platform: SocialPlatform,
  raw: string
): string {
  if (platform === "facebook") {
    return sanitizeFacebookHandle(raw);
  }
  return sanitizeLatinHandle(raw);
}

export function socialProfileUrl(
  platform: SocialPlatform,
  handle: string
): string {
  const h = handle.replace(/^@+/, "").replace(/^~+/, "");
  switch (platform) {
    case "instagram":
      return `https://instagram.com/${encodeURIComponent(h)}`;
    case "facebook":
      return `https://www.facebook.com/${encodeURIComponent(h)}`;
    case "line":
      return `https://line.me/ti/p/~${encodeURIComponent(h)}`;
    default:
      return `https://instagram.com/${encodeURIComponent(h)}`;
  }
}

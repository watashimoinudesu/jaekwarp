import { SiFacebook, SiInstagram, SiLine } from "react-icons/si";

import type { SocialPlatform } from "@/lib/social";

/**
 * ไอคอนแบรนด์โซเชียล — ใช้ชุด Simple Icons ผ่าน `react-icons`
 * (Lucide ที่ shadcn ใช้ไม่มีโลโก้ Facebook/Instagram แล้วในหลายเวอร์ชัน)
 */
export function SocialIcon({
  platform,
  className,
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  switch (platform) {
    case "instagram":
      return <SiInstagram className={className} aria-hidden />;
    case "facebook":
      return <SiFacebook className={className} aria-hidden />;
    case "line":
      return (
        <SiLine
          className={["text-[#06C755]", className].filter(Boolean).join(" ")}
          aria-hidden
        />
      );
    default:
      return null;
  }
}

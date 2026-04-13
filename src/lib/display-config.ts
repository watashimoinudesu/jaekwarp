/** วินาทีต่อรอบบนจอ (ค่า default) — เปลี่ยนได้ด้วย NEXT_PUBLIC_DISPLAY_ITEM_SECONDS */
export const DEFAULT_DISPLAY_ITEM_SECONDS = 30;

export function getDisplayItemMs(): number {
  const raw = process.env.NEXT_PUBLIC_DISPLAY_ITEM_SECONDS;
  const sec = raw ? Number.parseInt(raw, 10) : DEFAULT_DISPLAY_ITEM_SECONDS;
  if (!Number.isFinite(sec) || sec < 5) return DEFAULT_DISPLAY_ITEM_SECONDS * 1000;
  return sec * 1000;
}

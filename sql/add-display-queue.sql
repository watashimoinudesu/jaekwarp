-- คิวแสดงผล: pending = รอคิว, showing = กำลังขึ้นจอ, done = แสดงจบแล้ว
-- รันครั้งเดียวใน Supabase SQL Editor

alter table public.uploads
  add column if not exists display_status text;

-- ข้อมูลเก่า:ถือว่าแสดงครบแล้ว ไม่ให้ไปแย่งคิวกับรายการใหม่
update public.uploads
set display_status = 'done'
where display_status is null;

alter table public.uploads
  alter column display_status set default 'pending';

alter table public.uploads
  alter column display_status set not null;

-- (ทางเลือก) จำกัดค่าใน DB
-- alter table public.uploads
--   add constraint uploads_display_status_check
--   check (display_status in ('pending', 'showing', 'done'));

"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

import { SocialIcon } from "@/components/SocialIcon";
import { CAPTION_MAX_CHARS } from "@/lib/caption";
import { CROP_ASPECT, getCroppedImageBlob } from "@/lib/cropImage";
import {
  SOCIAL_LABEL,
  SOCIAL_PLACEHOLDER,
  SOCIAL_PLATFORMS,
  sanitizeSocialHandle,
  type SocialPlatform,
} from "@/lib/social";

export default function UploadPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [caption, setCaption] = useState("");
  const [socialPlatform, setSocialPlatform] =
    useState<SocialPlatform>("instagram");
  const [socialHandle, setSocialHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [cropBusy, setCropBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback(
    (_croppedArea: Area, pixels: Area) => {
      setCroppedAreaPixels(pixels);
    },
    []
  );

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked || !picked.type.startsWith("image/")) return;

    if (imageSrc) URL.revokeObjectURL(imageSrc);

    setImageSrc(URL.createObjectURL(picked));
    setFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    e.target.value = "";
  };

  const handleConfirmCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setCropBusy(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      const name = "photo.jpg";
      const next = new File([blob], name, { type: "image/jpeg" });
      setFile(next);
    } catch (err) {
      console.error(err);
      alert("ครอบภาพไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setCropBusy(false);
    }
  };

  const handleRecrop = () => {
    setFile(null);
  };

  const handlePickAnother = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);
      formData.append("social_platform", socialPlatform);
      formData.append("social_handle", socialHandle);

      await axios.post("/api/upload", formData);

      alert("Upload success!");

      handlePickAnother();
      setCaption("");
      setSocialPlatform("instagram");
      setSocialHandle("");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-10 text-zinc-100">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <h2 className="text-xl font-semibold tracking-tight">Upload</h2>

        <div className="flex flex-col gap-2 text-sm text-zinc-400">
          <span>รูปภาพ</span>
          {!imageSrc ? (
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="sr-only"
              />
              <span className="inline-flex rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500">
                เลือกรูป
              </span>
            </label>
          ) : !file ? (
            <div className="flex flex-col gap-4">
              {/*
                จำกัดความสูงตามจอ (dvh) — ถ้าใช้แค่ aspect + w-full บนมือถือกล่องจะสูงเกินจอ ลากครอบไม่ได้ / เลื่อนชนเบราว์เซอร์
              */}
              <div
                className="relative mx-auto w-full max-w-full touch-none select-none overflow-hidden rounded-xl bg-zinc-900 [-webkit-touch-callout:none]"
                style={{
                  height: "min(72dvh, 560px)",
                  width: "min(100%, calc(min(72dvh, 560px) * 9 / 16))",
                }}
              >
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={CROP_ASPECT}
                  cropShape="rect"
                  showGrid
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  mediaProps={{
                    draggable: false,
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex touch-manipulation items-center gap-3 text-xs text-zinc-500">
                  <span className="shrink-0">ซูม</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="h-2 w-full accent-violet-500"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleConfirmCrop}
                  disabled={!croppedAreaPixels || cropBusy}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cropBusy ? "กำลังประมวลผล..." : "ยืนยันการครอบภาพ"}
                </button>
                <button
                  type="button"
                  onClick={handlePickAnother}
                  className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  เลือกรูปอื่น
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {previewUrl ? (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                  <img
                    src={previewUrl}
                    alt="ตัวอย่างหลังครอบ"
                    className="max-h-56 w-full object-contain"
                  />
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRecrop}
                  className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  ปรับการครอบใหม่
                </button>
                <button
                  type="button"
                  onClick={handlePickAnother}
                  className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  เลือกรูปอื่น
                </button>
              </div>
            </div>
          )}
        </div>

        <label className="flex flex-col gap-2 text-sm text-zinc-400">
          <span className="flex items-center justify-between gap-2">
            <span>ข้อความ</span>
            <span className="tabular-nums text-xs text-zinc-500">
              {caption.length}/{CAPTION_MAX_CHARS}
            </span>
          </span>
          <input
            type="text"
            placeholder="ใส่ข้อความ"
            value={caption}
            maxLength={CAPTION_MAX_CHARS}
            onChange={(e) => setCaption(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </label>

        <div className="flex flex-col gap-2 text-sm text-zinc-400">
          <span>Social Media (Optional)</span>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <div className="relative shrink-0 sm:w-[44%]">
              <select
                value={socialPlatform}
                onChange={(e) =>
                  setSocialPlatform(e.target.value as SocialPlatform)
                }
                className="h-full w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 pr-8 pl-3 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {SOCIAL_LABEL[p]}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-zinc-500">
                ▾
              </span>
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500">
              <SocialIcon
                platform={socialPlatform}
                className={
                  socialPlatform === "line"
                    ? "h-6 shrink-0"
                    : "h-5 w-5 shrink-0 text-zinc-300"
                }
              />
              <input
                type="text"
                name="social_handle"
                {...(socialPlatform === "facebook"
                  ? {}
                  : { lang: "en" })}
                inputMode="text"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder={SOCIAL_PLACEHOLDER[socialPlatform]}
                value={socialHandle}
                onChange={(e) =>
                  setSocialHandle(
                    sanitizeSocialHandle(socialPlatform, e.target.value)
                  )
                }
                className="min-w-0 flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !file}
          className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

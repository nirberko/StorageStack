"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { setProfilePhoto } from "@/app/actions/profile";
import { Avatar } from "@/components/Avatar";
import { AVATAR_BUCKET, AVATAR_MAX_PICK_BYTES, AVATAR_SIZE } from "@/lib/avatar";
import { createClient } from "@/lib/supabase/client";

/** Center-crop the picked image to a square, scale it down and re-encode it (also drops EXIF data). */
async function toSquarePhoto(file: File): Promise<{ blob: Blob; ext: "webp" | "jpg" }> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const out = Math.min(AVATAR_SIZE, side);
  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, out, out);
  bitmap.close();

  const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.86));
  const webp = await encode("image/webp");
  // Safari before 17 cannot encode WebP and hands back a PNG instead.
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };
  const jpg = await encode("image/jpeg");
  if (!jpg) throw new Error("encode failed");
  return { blob: jpg, ext: "jpg" };
}

function randomName() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function PhotoUpload({ userId, name, color, photo }: { userId: string; name: string; color: string; photo: string | null }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();
  const working = busy || pending;

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) return setError("Pick an image file (JPG, PNG or WebP).");
    if (file.size > AVATAR_MAX_PICK_BYTES) return setError("That photo is too large. Pick one under 15 MB.");

    setBusy(true);
    try {
      let photoFile: { blob: Blob; ext: "webp" | "jpg" };
      try {
        photoFile = await toSquarePhoto(file);
      } catch {
        setError("We could not read that photo. Try a JPG or PNG.");
        return;
      }
      const path = `${userId}/${randomName()}.${photoFile.ext}`;
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, photoFile.blob, { contentType: photoFile.blob.type, cacheControl: "31536000", upsert: false });
      if (upErr) {
        setError("The upload failed. Please try again.");
        return;
      }
      const res = await setProfilePhoto(path);
      if (!res.ok) {
        await supabase.storage.from(AVATAR_BUCKET).remove([path]);
        setError(res.error);
        return;
      }
      start(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    setError(null);
    start(async () => {
      const res = await setProfilePhoto(null);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div>
      <span className="d-label">Profile photo</span>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ opacity: working ? 0.5 : 1, transition: "opacity .2s" }}>
          <Avatar name={name} color={color} photo={photo} size={72} radius={22} fontSize={22} label={`${name}'s photo`} />
        </span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} hidden />
          <button className="m-btn m-btn-s" type="button" disabled={working} onClick={() => input.current?.click()}>
            {busy ? "Uploading…" : photo ? "Change photo" : "Upload photo"}
          </button>
          {photo && (
            <button className="m-btn m-btn-line" type="button" disabled={working} onClick={remove}>
              Remove
            </button>
          )}
        </div>
      </div>
      <span className="d-help">A square photo works best. We crop it to a square and shrink it for you.</span>
      {error && (
        <div className="m-alert err" role="alert" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}
    </div>
  );
}

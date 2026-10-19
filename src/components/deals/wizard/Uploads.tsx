"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { createClient } from "@/lib/supabase/client";
import { photoUrl } from "@/lib/storage";
import { DOC_SLOTS, extOf, type Draft, type UploadedFile } from "./model";

const MAX_PHOTOS = 20;
const MAX_PHOTO_MB = 10;
const MAX_DOC_MB = 25;

function storagePath(userId: string, file: File) {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80) || "file";
  return `${userId}/${crypto.randomUUID()}-${safe}`;
}

function labelFor(filename: string) {
  const base = filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim().slice(0, 40) || "Photo";
  return base.charAt(0).toUpperCase() + base.slice(1);
}

type Props = { draft: Draft; userId: string; update: (patch: Partial<Draft>) => void };

export function PhotoUploads({ draft, userId, update }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Uploads finish asynchronously; read the latest list rather than the one from when they started.
  const photosRef = useRef(draft.photos);
  photosRef.current = draft.photos;

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const room = MAX_PHOTOS - photosRef.current.length;
    if (list.length === 0) return setError("Choose image files (JPG, PNG or WebP).");
    const tooBig = list.find((f) => f.size > MAX_PHOTO_MB * 1024 * 1024);
    if (tooBig) return setError(`${tooBig.name} is over ${MAX_PHOTO_MB} MB.`);
    setError(room < list.length ? `Only ${MAX_PHOTOS} photos fit. We added the first ${Math.max(room, 0)}.` : null);

    const supabase = createClient();
    for (const file of list.slice(0, Math.max(room, 0))) {
      setBusy((b) => b + 1);
      const path = storagePath(userId, file);
      const { error: err } = await supabase.storage.from("deal-photos").upload(path, file, { contentType: file.type });
      setBusy((b) => b - 1);
      if (err) {
        setError(`Could not upload ${file.name}: ${err.message}`);
        continue;
      }
      const next = [...photosRef.current, { path, name: file.name, label: labelFor(file.name) }];
      photosRef.current = next;
      update({ photos: next });
    }
  }

  async function remove(path: string) {
    update({ photos: photosRef.current.filter((p) => p.path !== path) });
    await createClient().storage.from("deal-photos").remove([path]);
  }

  const picker = (
    <input
      ref={input}
      type="file"
      accept="image/*"
      multiple
      hidden
      onChange={(e) => {
        if (e.target.files) upload(e.target.files);
        e.target.value = "";
      }}
    />
  );

  const dropProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setOver(true);
    },
    onDragLeave: () => setOver(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setOver(false);
      upload(e.dataTransfer.files);
    },
  };

  return (
    <div>
      {picker}
      {draft.photos.length === 0 && busy === 0 ? (
        <div className={`p-drop${over ? " over" : ""}`} {...dropProps}>
          <span style={{ width: 56, height: 56, borderRadius: 18, display: "inline-grid", placeItems: "center", background: "#FFEDE2" }}>
            <Icon name="camera" size={26} stroke="#DB520B" />
          </span>
          <b style={{ display: "block", marginTop: 12, fontSize: 16 }}>Drag photos here</b>
          <span style={{ display: "block", marginTop: 4, fontSize: 14, color: "#5E6B7E" }}>Front, gate, hallways, office. Up to {MAX_PHOTOS} photos.</span>
          <button className="m-btn m-btn-o" type="button" onClick={() => input.current?.click()} style={{ marginTop: 16 }}>
            Choose photos
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }} {...dropProps}>
          {draft.photos.map((p, i) => (
            <div key={p.path} style={{ position: "relative", height: 120, borderRadius: 16, overflow: "hidden", background: "#E6EBF3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl(p.path)} alt={p.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {i === 0 && (
                <span className="d-pill" style={{ position: "absolute", top: 8, left: 8, background: "#0B1F3A", color: "#fff", padding: "4px 8px" }}>
                  Cover
                </span>
              )}
              <button
                type="button"
                aria-label={`Remove photo ${p.label}`}
                onClick={() => remove(p.path)}
                style={{ position: "absolute", top: 6, right: 6, width: 32, height: 32, borderRadius: 10, border: 0, background: "rgba(255,255,255,0.94)", color: "#0B1F3A", display: "grid", placeItems: "center" }}
              >
                <Icon name="x" size={15} strokeWidth={2.4} />
              </button>
            </div>
          ))}
          {Array.from({ length: busy }, (_, i) => (
            <div key={`busy-${i}`} style={{ height: 120, borderRadius: 16, background: "#F3F5F9", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, color: "#5E6B7E" }}>
              Uploading…
            </div>
          ))}
          {draft.photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => input.current?.click()}
              className={over ? "p-drop over" : undefined}
              style={{ height: 120, borderRadius: 16, border: "2px dashed #CBD3E0", background: "#FAFBFD", color: "#4A576B", fontWeight: 700, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: 0 }}
            >
              <Icon name="plus" size={22} strokeWidth={2.2} />
              Add more
            </button>
          )}
        </div>
      )}
      {error && (
        <div className="m-alert err" role="alert" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}

export function DocumentUploads({ draft, userId, update }: Props) {
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const docsRef = useRef(draft.docs);
  docsRef.current = draft.docs;

  async function upload(slot: string, file: File) {
    if (file.size > MAX_DOC_MB * 1024 * 1024) return setError(`${file.name} is over ${MAX_DOC_MB} MB.`);
    setError(null);
    setBusy((b) => ({ ...b, [slot]: true }));
    const supabase = createClient();
    const path = storagePath(userId, file);
    const { error: err } = await supabase.storage.from("deal-docs").upload(path, file, { contentType: file.type || "application/octet-stream" });
    setBusy((b) => ({ ...b, [slot]: false }));
    if (err) return setError(`Could not upload ${file.name}: ${err.message}`);
    const old = docsRef.current[slot];
    const next: Record<string, UploadedFile> = { ...docsRef.current, [slot]: { path, name: file.name } };
    docsRef.current = next;
    update({ docs: next });
    if (old) await supabase.storage.from("deal-docs").remove([old.path]);
  }

  async function remove(slot: string) {
    const old = docsRef.current[slot];
    if (!old) return;
    const next = { ...docsRef.current };
    delete next[slot];
    update({ docs: next });
    await createClient().storage.from("deal-docs").remove([old.path]);
  }

  return (
    <div>
      {DOC_SLOTS(draft.type).map((s) => {
        const doc = draft.docs[s.id];
        const ext = doc ? extOf(doc.name) : s.ext;
        const isSheet = ext === "XLS" || ext === "CSV";
        return (
          <div key={s.id} className="p-row">
            <span style={{ width: 44, height: 44, borderRadius: 13, flex: "none", display: "grid", placeItems: "center", background: isSheet ? "#DDF3E8" : "#FCE5E5", fontSize: 11, fontWeight: 800, color: isSheet ? "#17603F" : "#A82A2A" }}>
              {ext}
            </span>
            <span style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
              <b style={{ display: "block", fontSize: 15 }}>{s.name}</b>
              <span style={{ fontSize: 13, color: "#5E6B7E", overflowWrap: "anywhere" }}>
                {doc ? `${doc.name} · private until you approve someone` : s.meta}
              </span>
            </span>
            <input
              ref={(el) => {
                inputs.current[s.id] = el;
              }}
              type="file"
              hidden
              accept=".pdf,.xls,.xlsx,.csv,.doc,.docx,.txt,.png,.jpg,.jpeg"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(s.id, f);
                e.target.value = "";
              }}
            />
            {doc && (
              <button type="button" className="p-edit" onClick={() => remove(s.id)} aria-label={`Remove ${s.name}`}>
                Remove
              </button>
            )}
            <button
              className={`m-btn ${doc ? "done" : "m-btn-s"}`}
              type="button"
              disabled={busy[s.id]}
              onClick={() => inputs.current[s.id]?.click()}
              aria-label={doc ? `Replace ${s.name}` : `Upload ${s.name}`}
              style={{ minHeight: 40, fontSize: 14 }}
            >
              {doc && <Icon name="check" size={15} strokeWidth={3} />}
              {busy[s.id] ? "Uploading…" : doc ? "Uploaded" : "Upload"}
            </button>
          </div>
        );
      })}
      {error && (
        <div className="m-alert err" role="alert" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}

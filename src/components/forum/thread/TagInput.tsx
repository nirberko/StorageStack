"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/Icon";

const MAX_TAGS = 4;
const MAX_LEN = 24;

/** Chip input for tags. Enter or comma adds a tag; Backspace on an empty field removes the last one. */
export function TagInput({ name, id, initial = [] }: { name: string; id: string; initial?: string[] }) {
  const [tags, setTags] = useState<string[]>(initial.slice(0, MAX_TAGS));
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const full = tags.length >= MAX_TAGS;

  function add(raw: string) {
    const next = [...tags];
    for (const part of raw.split(",")) {
      const tag = part.trim().replace(/\s+/g, " ").slice(0, MAX_LEN);
      if (!tag || next.length >= MAX_TAGS) continue;
      if (next.some((t) => t.toLowerCase() === tag.toLowerCase())) continue;
      next.push(tag);
    }
    setTags(next);
    setText("");
  }

  function remove(i: number) {
    setTags(tags.filter((_, j) => j !== i));
    inputRef.current?.focus();
  }

  return (
    <div className="tag-box" onClick={() => inputRef.current?.focus()}>
      <input type="hidden" name={name} value={tags.join(",")} />
      {tags.map((t, i) => (
        <span key={t} className="tag-chip">
          {t}
          <button type="button" aria-label={`Remove tag ${t}`} onClick={(e) => { e.stopPropagation(); remove(i); }}>
            <Icon name="x" size={12} strokeWidth={2.6} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        id={id}
        value={text}
        maxLength={MAX_LEN * MAX_TAGS}
        placeholder={full ? "" : tags.length ? "Add another" : "Type a tag and press Enter"}
        aria-label={full ? "Tags (4 of 4 added)" : undefined}
        aria-describedby={`${id}-help`}
        onChange={(e) => {
          const v = e.target.value;
          if (v.includes(",")) add(v);
          else if (!full) setText(v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (text.trim()) add(text);
          } else if (e.key === "Backspace" && !text && tags.length) {
            setTags(tags.slice(0, -1));
          }
        }}
        onBlur={() => text.trim() && add(text)}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData("text");
          if (pasted.includes(",")) {
            e.preventDefault();
            add(text + pasted);
          }
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import type { Category } from "@/lib/types";

const GROUPS = ["Start here", "Buy & build", "Operate", "Money & legal"];

/**
 * Topic dropdown grouped by section. Follows the select-only combobox pattern: the button keeps
 * focus, arrow keys move the highlighted option, Enter or Space picks it, Escape closes.
 */
export function TopicSelect({
  categories, value, onChange, labelId,
}: { categories: Category[]; value: string; onChange: (id: string) => void; labelId: string }) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const ordered = GROUPS.flatMap((g) => categories.filter((c) => c.group_name === g));
  const [active, setActive] = useState(() => Math.max(0, ordered.findIndex((c) => c.id === value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selected = categories.find((c) => c.id === value);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function openList() {
    setActive(Math.max(0, ordered.findIndex((c) => c.id === value)));
    setOpen(true);
  }

  function pick(i: number) {
    onChange(ordered[i].id);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "ArrowDown") setActive((i) => Math.min(ordered.length - 1, i + 1));
    else if (e.key === "ArrowUp") setActive((i) => Math.max(0, i - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(ordered.length - 1);
    else if (e.key === "Enter" || e.key === " ") pick(active);
    else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      if (e.key === "Tab") return;
    } else if (e.key.length === 1) {
      // Jump to the next topic starting with the typed letter.
      const ch = e.key.toLowerCase();
      const next = ordered.findIndex((c, i) => i > active && c.name.toLowerCase().startsWith(ch));
      const wrap = ordered.findIndex((c) => c.name.toLowerCase().startsWith(ch));
      if (next >= 0 || wrap >= 0) setActive(next >= 0 ? next : wrap);
    } else return;
    e.preventDefault();
  }

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        role="combobox"
        className="topic-trigger"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        {selected ? (
          <>
            <span className="m-ic" style={{ background: selected.tint }}>
              <Icon d={selected.icon} size={17} stroke={selected.color} />
            </span>
            <span style={{ minWidth: 0, lineHeight: 1.3 }}>
              <b style={{ display: "block", fontSize: 15 }}>{selected.name}</b>
              <span style={{ display: "block", fontSize: 12, color: "#5E6B7E" }}>{selected.group_name}</span>
            </span>
          </>
        ) : (
          <span style={{ color: "#8A96A8", fontWeight: 600 }}>Choose a topic</span>
        )}
        <Icon d="M6 9l6 6 6-6" size={18} strokeWidth={2.4} style={{ marginLeft: "auto", flex: "none", transform: open ? "rotate(180deg)" : undefined }} />
      </button>

      {open && (
        <div ref={listRef} id={listId} role="listbox" aria-labelledby={labelId} className="topic-list">
          {GROUPS.map((g) => {
            const items = ordered.map((c, i) => ({ c, i })).filter(({ c }) => c.group_name === g);
            if (items.length === 0) return null;
            const groupId = `${listId}-g-${g.replace(/\W+/g, "")}`;
            return (
              <div key={g} role="group" aria-labelledby={groupId}>
                <div id={groupId} className="topic-group">
                  {g}
                </div>
                {items.map(({ c, i }) => {
                  const on = c.id === value;
                  return (
                    <div
                      key={c.id}
                      id={`${listId}-${i}`}
                      data-index={i}
                      role="option"
                      aria-selected={on}
                      className={`topic-opt${i === active ? " active" : ""}`}
                      onMouseEnter={() => setActive(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(i)}
                    >
                      <span className="m-ic" style={{ background: c.tint }}>
                        <Icon d={c.icon} size={17} stroke={c.color} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                        <b style={{ display: "block", fontSize: 14 }}>{c.name}</b>
                        <span style={{ display: "block", fontSize: 12, color: "#5E6B7E" }}>{c.description}</span>
                      </span>
                      {on && <Icon name="check" size={16} strokeWidth={2.8} stroke="#DB520B" style={{ flex: "none" }} />}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

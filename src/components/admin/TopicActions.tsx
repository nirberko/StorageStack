"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteTopic, moveTopic } from "@/app/actions/admin";
import { Icon } from "@/components/Icon";
import { plural } from "@/lib/format";

export function MoveTopic({ id, name, first, last }: { id: string; name: string; first: boolean; last: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function move(dir: -1 | 1) {
    start(async () => {
      const res = await moveTopic(id, dir);
      if (res.ok) {
        setError(null);
        router.refresh();
      } else setError(res.error);
    });
  }

  return (
    <>
      {error && (
        <span role="alert" style={{ fontSize: 13, fontWeight: 700, color: "#A82A2A" }}>
          {error}
        </span>
      )}
      <button className="x-icon-btn" type="button" aria-label={`Move ${name} up`} disabled={first || pending} onClick={() => move(-1)} style={{ width: 40, height: 40, opacity: first ? 0.4 : 1 }}>
        <Icon d="M6 15l6-6 6 6" />
      </button>
      <button className="x-icon-btn" type="button" aria-label={`Move ${name} down`} disabled={last || pending} onClick={() => move(1)} style={{ width: 40, height: 40, opacity: last ? 0.4 : 1 }}>
        <Icon d="M6 9l6 6 6-6" />
      </button>
    </>
  );
}

export function DeleteTopic({
  id, name, discussions, others,
}: { id: string; name: string; discussions: number; others: { id: string; name: string; group_name: string }[] }) {
  const [moveTo, setMoveTo] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const needsMove = discussions > 0;

  function remove() {
    const target = others.find((o) => o.id === moveTo);
    const msg = needsMove
      ? `Delete "${name}" and move its ${plural(discussions, "discussion")} to "${target?.name}"?`
      : `Delete "${name}"? This cannot be undone.`;
    if (!confirm(msg)) return;
    start(async () => {
      // On success the action redirects back to the topic list.
      const res = await deleteTopic(id, needsMove ? moveTo : null);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {error && (
        <div className="m-alert err" role="alert">
          {error}
        </div>
      )}
      {needsMove && (
        <div>
          <label className="d-label" htmlFor="move_to">
            Move its {plural(discussions, "discussion")} to
          </label>
          <select id="move_to" className="d-input" value={moveTo} onChange={(e) => setMoveTo(e.target.value)} style={{ maxWidth: 440 }}>
            <option value="">Pick a topic…</option>
            {others.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.group_name})
              </option>
            ))}
          </select>
          <span className="d-help">Members who followed this topic stop following it. Links to it will show all discussions.</span>
        </div>
      )}
      <div>
        <button
          className="m-btn m-btn-line"
          type="button"
          disabled={pending || (needsMove && !moveTo)}
          onClick={remove}
          style={{ color: "#A82A2A", borderColor: "#F2C4C4" }}
        >
          <Icon name="trash" />
          {pending ? "Deleting…" : "Delete topic"}
        </button>
      </div>
    </div>
  );
}

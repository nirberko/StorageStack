"use client";

import { useActionState, useState } from "react";
import { saveTopic, type TopicFormState } from "@/app/actions/admin";
import { Icon } from "@/components/Icon";
import { TOPIC_COLORS, TOPIC_GROUPS, TOPIC_ICONS } from "@/lib/config";
import type { Category } from "@/lib/types";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .replace(/-+$/, "");
}

export function TopicForm({ topic }: { topic?: Category }) {
  const [state, action, pending] = useActionState<TopicFormState, FormData>(saveTopic, {});
  const [name, setName] = useState(topic?.name ?? "");
  const [slug, setSlug] = useState(topic?.id ?? "");
  const [slugEdited, setSlugEdited] = useState(false);
  const [group, setGroup] = useState(topic?.group_name && TOPIC_GROUPS.includes(topic.group_name) ? topic.group_name : TOPIC_GROUPS[0]);
  const [description, setDescription] = useState(topic?.description ?? "");
  const [color, setColor] = useState(() => (TOPIC_COLORS.find((c) => c.color === topic?.color) ?? TOPIC_COLORS[0]).name);
  // A topic whose icon is not in the standard set keeps it as the first choice.
  const icons = topic && !TOPIC_ICONS.some((i) => i.d === topic.icon) ? [{ name: "Current icon", d: topic.icon }, ...TOPIC_ICONS] : TOPIC_ICONS;
  const [icon, setIcon] = useState(topic?.icon ?? TOPIC_ICONS[0].d);
  const c = TOPIC_COLORS.find((x) => x.name === color) ?? TOPIC_COLORS[0];
  const id = topic ? topic.id : slugEdited ? slug : slugify(name);

  return (
    <form action={action} style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
      <div style={{ flex: "999 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
        {state.error && (
          <div className="m-alert err" role="alert">
            {state.error}
          </div>
        )}
        {state.saved && (
          <div className="m-alert ok" role="status">
            The topic is saved.
          </div>
        )}
        {topic && <input type="hidden" name="original_id" value={topic.id} />}
        <div>
          <label className="d-label" htmlFor="name">
            Name
          </label>
          <input id="name" name="name" className="d-input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={40} placeholder="e.g. Insurance" />
        </div>
        <div>
          <label className="d-label" htmlFor="id">
            Link name
          </label>
          <input
            id="id"
            name="id"
            className="d-input"
            value={id}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value.toLowerCase());
            }}
            readOnly={!!topic}
            required
            pattern="[a-z0-9][a-z0-9\-]{1,29}"
            maxLength={30}
            style={topic ? { background: "#F5F6FA", color: "#5E6B7E" } : undefined}
          />
          <span className="d-help">
            {topic ? "Used in links to this topic, so it cannot change." : "Used in links: lowercase letters, numbers and dashes. It cannot change later."}
          </span>
        </div>
        <div>
          <label className="d-label" htmlFor="group_name">
            Section
          </label>
          <select id="group_name" name="group_name" className="d-input" value={group} onChange={(e) => setGroup(e.target.value)} style={{ maxWidth: 320 }}>
            {TOPIC_GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <span className="d-help">Where the topic appears in the forum sidebar.</span>
        </div>
        <div>
          <label className="d-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="d-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={160}
            placeholder="One line on what belongs here."
            style={{ minHeight: 90 }}
          />
          <span className="d-help">{160 - description.length} characters left</span>
        </div>
        <fieldset className="a-fieldset">
          <legend className="d-label">Color</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TOPIC_COLORS.map((x) => (
              <label key={x.name} className={`a-swatch${x.name === color ? " on" : ""}`} title={x.name}>
                <input className="sr-only" type="radio" name="color" value={x.name} checked={x.name === color} onChange={() => setColor(x.name)} />
                <span style={{ background: x.tint }}>
                  <span style={{ background: x.color }} />
                </span>
                <span className="sr-only">{x.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="a-fieldset">
          <legend className="d-label">Icon</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {icons.map((x) => (
              <label key={x.name} className={`a-swatch${x.d === icon ? " on" : ""}`} title={x.name}>
                <input className="sr-only" type="radio" name="icon" value={x.d} checked={x.d === icon} onChange={() => setIcon(x.d)} />
                <span style={{ background: c.tint }}>
                  <Icon d={x.d} size={20} stroke={c.color} />
                </span>
                <span className="sr-only">{x.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="m-btn m-btn-o" type="submit" disabled={pending} style={{ minWidth: 160 }}>
            {pending ? "Saving…" : topic ? "Save changes" : "Create topic"}
          </button>
        </div>
      </div>

      <aside style={{ flex: "1 1 260px", maxWidth: "100%", display: "flex", flexDirection: "column", gap: 12 }} aria-label="Preview">
        <span className="m-sec" style={{ padding: "0 2px" }}>
          Preview
        </span>
        <div className="m-card" style={{ padding: 8 }}>
          <div className="m-sec" style={{ padding: "8px 10px 6px" }}>
            {group}
          </div>
          <span className="m-side">
            <span className="m-ic" style={{ background: c.tint }}>
              <Icon d={icon} size={17} stroke={c.color} />
            </span>
            <span style={{ minWidth: 0, lineHeight: 1.25 }}>{name || "Topic name"}</span>
          </span>
          <span className="m-side on">
            <span className="m-ic">
              <Icon d={icon} size={17} stroke="#FFFFFF" />
            </span>
            <span style={{ minWidth: 0, lineHeight: 1.25 }}>{name || "Topic name"}</span>
          </span>
        </div>
        <div className="m-card" style={{ padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
          <span className="m-ic" style={{ width: 48, height: 48, borderRadius: 15, background: c.tint }}>
            <Icon d={icon} size={22} stroke={c.color} />
          </span>
          <span style={{ minWidth: 0 }}>
            <b style={{ display: "block", fontSize: 17, fontWeight: 800 }}>{name || "Topic name"}</b>
            <span style={{ display: "block", marginTop: 2, fontSize: 13, color: "#5E6B7E" }}>{description || "Description"}</span>
          </span>
        </div>
      </aside>
    </form>
  );
}

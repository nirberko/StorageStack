import sanitizeHtml from "sanitize-html";

// Post bodies are HTML from the rich editor. Older posts are plain text. Anyone can write a body
// straight to the database, so bodies are sanitized every time they are rendered, not only on save.

const RICH: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "h2", "h3", "ul", "ol", "li", "blockquote", "code", "pre", "a", "hr"],
  allowedAttributes: { a: ["href", "rel", "target"] },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, rel: "nofollow noopener noreferrer", target: "_blank" } }),
  },
};

export function isHtml(body: string): boolean {
  return /^\s*</.test(body);
}

export function sanitizeRich(html: string): string {
  // Links always get rel/target from transformTags, overriding anything supplied.
  return sanitizeHtml(html, RICH)
    .replace(/^(<p>(\s|<br\s*\/?>)*<\/p>)+|(<p>(\s|<br\s*\/?>)*<\/p>)+$/g, "");
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Safe HTML for any post body, rich or plain. */
export function bodyToHtml(body: string): string {
  if (isHtml(body)) return sanitizeRich(body);
  return body
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** Plain text for excerpts and length checks. */
export function toPlainText(body: string): string {
  if (!isHtml(body)) return body;
  const spaced = body.replace(/<\/(p|h2|h3|li|blockquote|pre)>|<br\s*\/?>/gi, " ");
  return sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

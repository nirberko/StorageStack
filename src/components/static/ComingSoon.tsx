import type { ReactNode } from "react";

/**
 * A "coming soon" page for a section that is not built yet: a preview of what will be there,
 * then the title, a short explanation and what to do in the meantime. Everything is centered
 * in the space under the header. Reuse it for every placeholder page.
 */
export function ComingSoon({ preview, title, text, children, more }: { preview: ReactNode; title: string; text: string; children?: ReactNode; more?: ReactNode }) {
  return (
    <div className="wrap cs-page">
      <section className="cs-in">
        <div className="cs-preview">{preview}</div>
        <span className="cs-soon">Coming soon</span>
        <h1>{title}</h1>
        <p>{text}</p>
        {children && <div className="cs-actions">{children}</div>}
        {more && <div className="cs-more">{more}</div>}
      </section>
    </div>
  );
}

/** A small "Example" tag, so a preview never reads as real data. */
export function ExampleTag() {
  return <span className="cs-example">Example</span>;
}

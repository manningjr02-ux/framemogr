/**
 * Server-compatible JSON-LD injection.
 * All JSON-LD must be rendered through this component so escaping is applied.
 * Escapes < to \u003c to prevent script injection / break.
 */
function escapeJsonLd(json: string): string {
  return json.replace(/</g, "\\u003c");
}

export function safeJsonLdStringify(data: object): string {
  return escapeJsonLd(JSON.stringify(data));
}

export default function JsonLd({ data }: { data: object }) {
  const json = safeJsonLdStringify(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

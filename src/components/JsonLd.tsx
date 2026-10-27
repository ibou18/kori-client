/** Injecte un bloc JSON-LD (données structurées schema.org). Composant serveur. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Échappe « < » pour empêcher toute fermeture prématurée de la balise script.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

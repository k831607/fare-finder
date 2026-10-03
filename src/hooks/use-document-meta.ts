import { useEffect } from "react";

type DocumentMeta = {
  title: string;
  description?: string;
};

function setMetaContent(selector: string, content: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.content = content;
}

/**
 * Client-side replacement for the per-route `head()` metadata that TanStack Start
 * rendered on the server. Updates the document title and the description /
 * Open Graph tags declared in index.html whenever a page mounts.
 */
export function useDocumentMeta({ title, description }: DocumentMeta) {
  useEffect(() => {
    document.title = title;
    setMetaContent('meta[property="og:title"]', title);
    if (description) {
      setMetaContent('meta[name="description"]', description);
      setMetaContent('meta[property="og:description"]', description);
    }
  }, [title, description]);
}

"use client";

import { useEffect } from "react";

/**
 * Injects admin-managed HTML/script snippets into head or end of body.
 * Scripts are re-created as real <script> nodes so browsers execute them.
 */
export function SiteScriptsInject({
  html,
  target,
}: {
  html: string;
  target: "head" | "body";
}) {
  useEffect(() => {
    const raw = html?.trim();
    if (!raw) return;

    const wrapper = document.createElement("div");
    // If admin pasted raw JS without tags, wrap it.
    const looksLikeMarkup = /<\/?[a-z][\s\S]*>/i.test(raw);
    wrapper.innerHTML = looksLikeMarkup
      ? raw
      : `<script>${raw}</script>`;

    const parent = target === "head" ? document.head : document.body;
    const mounted: Node[] = [];

    Array.from(wrapper.childNodes).forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const old = node as HTMLScriptElement;
        const script = document.createElement("script");
        Array.from(old.attributes).forEach((attr) => {
          script.setAttribute(attr.name, attr.value);
        });
        if (old.textContent) script.text = old.textContent;
        parent.appendChild(script);
        mounted.push(script);
        return;
      }

      const clone = node.cloneNode(true);
      parent.appendChild(clone);
      mounted.push(clone);
    });

    return () => {
      mounted.forEach((node) => {
        node.parentNode?.removeChild(node);
      });
    };
  }, [html, target]);

  return null;
}

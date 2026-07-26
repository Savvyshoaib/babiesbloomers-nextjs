"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectSiteContent } from "@/store/site-content-slice";

/** Keeps the browser tab favicon in sync with admin CMS branding. */
export function FaviconSync() {
  const favicon = useAppSelector(selectSiteContent).branding.favicon;

  useEffect(() => {
    if (!favicon) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = favicon;
  }, [favicon]);

  return null;
}

import React, { useEffect, useState } from "react";
import { agency, links, properties } from "@/lib/agency";
import { THEMES } from "@/lib/themes";
import ThemeSwitcher from "@/components/links/ThemeSwitcher";
import useShare from "@/components/links/useShare";
import { downloadVCard } from "@/lib/vcard";

const STORAGE_KEY = "villamare-tema";

const readInitialTheme = () => {
  const known = (id) => id && THEMES.some((theme) => theme.id === id);
  const requested = new URLSearchParams(window.location.search).get("tema");
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (known(requested)) return requested;
  if (known(saved)) return saved;
  return THEMES[0].id;
};

export default function Home() {
  const [themeId, setThemeId] = useState(readInitialTheme);
  const share = useShare(agency);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, themeId);
    const url = new URL(window.location.href);
    url.searchParams.set("tema", themeId);
    window.history.replaceState({}, "", url);
  }, [themeId]);

  const handleAction = (kind) => {
    if (kind === "share") share();
    if (kind === "vcard") downloadVCard(agency);
  };

  const current = THEMES.find((theme) => theme.id === themeId) || THEMES[0];
  const CurrentTheme = current.Component;

  return (
    <div className="min-h-screen">
      <CurrentTheme
        agency={agency}
        links={links}
        properties={properties}
        onAction={handleAction}
      />
      <ThemeSwitcher themes={THEMES} value={themeId} onChange={setThemeId} />
    </div>
  );
}
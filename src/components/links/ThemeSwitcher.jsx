import React from "react";

export default function ThemeSwitcher({ themes, value, onChange }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-3">
      <div className="no-scrollbar pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/15 bg-slate-950/85 p-1.5 shadow-[0_14px_44px_rgba(2,6,23,0.5)] backdrop-blur-xl">
        {themes.map((theme) => {
          const active = theme.id === value;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.id)}
              aria-pressed={active}
              aria-label={`Ver no tema ${theme.name}`}
              className={`flex min-h-[40px] shrink-0 items-center gap-2 rounded-full px-2.5 text-xs transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                active
                  ? "bg-white font-semibold text-slate-900"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                className="h-4 w-4 rounded-full border border-black/15"
                style={{ backgroundColor: theme.swatch }}
              />
              <span className={active ? "inline" : "hidden xl:inline"}>{theme.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
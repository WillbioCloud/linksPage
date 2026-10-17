import GlassTheme from "@/components/themes/GlassTheme";
import NeumorphTheme from "@/components/themes/NeumorphTheme";
import ObsidianTheme from "@/components/themes/ObsidianTheme";
import BrutalTheme from "@/components/themes/BrutalTheme";
import SageTheme from "@/components/themes/SageTheme";
import RetroTheme from "@/components/themes/RetroTheme";

export const THEMES = [
  { id: "vidro", name: "Vidro", Component: GlassTheme, swatch: "#00B4D8" },
  { id: "neumorfismo", name: "Neumorfismo", Component: NeumorphTheme, swatch: "#C8CFDA" },
  { id: "obsidiana", name: "Obsidiana", Component: ObsidianTheme, swatch: "#C5A059" },
  { id: "brutalista", name: "Brutalista", Component: BrutalTheme, swatch: "#FF3E00" },
  { id: "salvia", name: "Sálvia", Component: SageTheme, swatch: "#4A5D4E" },
  { id: "retro", name: "Retrô", Component: RetroTheme, swatch: "#FFC24B" },
];
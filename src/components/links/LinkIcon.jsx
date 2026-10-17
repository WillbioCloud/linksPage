import React from "react";
import {
  Building2,
  CalendarCheck,
  Download,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Share2,
} from "lucide-react";

const ICONS = {
  whatsapp: MessageCircle,
  imoveis: Building2,
  instagram: Instagram,
  reservar: CalendarCheck,
  email: Mail,
  maps: MapPin,
  vcard: Download,
  share: Share2,
};

export default function LinkIcon({ name, className }) {
  const Icon = ICONS[name] || MessageCircle;
  return <Icon className={className} aria-hidden="true" />;
}
export function downloadVCard(agency) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${agency.legalName}`,
    `ORG:${agency.legalName}`,
    `TITLE:${agency.role}`,
    `TEL;TYPE=CELL:${agency.phone}`,
    `EMAIL:${agency.email}`,
    `URL:${agency.instagram}`,
    `ADR;TYPE=WORK:;;${agency.city};;;Brasil`,
    `NOTE:${agency.tagline}`,
    "END:VCARD",
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "villa-mare-temporada.vcf";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
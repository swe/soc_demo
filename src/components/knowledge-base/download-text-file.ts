export function downloadTextFile({
  filename,
  content,
  mimeType = "text/plain;charset=utf-8",
}: {
  filename: string;
  content: string;
  mimeType?: string;
}) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

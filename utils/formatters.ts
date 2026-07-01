export function formatDate(value: string | null, locale: string) {
  if (!value) return "--";

  const parsed = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

  return parsed.toLocaleString();
}

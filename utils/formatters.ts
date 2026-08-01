export function formatDate(value: string | null, locale: string) {
  if (!value) return "--";

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(isDateOnly
      ? { timeZone: "UTC" }
      : { hour: "2-digit", minute: "2-digit" }),
  }).format(new Date(value));
}


export function formatDate(
  value,
  {
    showTime = false,
    locale = "en-GB",
  } = {}
) {
  if (!value) return "-";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";

  const options = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  if (showTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.second = "2-digit";
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
}

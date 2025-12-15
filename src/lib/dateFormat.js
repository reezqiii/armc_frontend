// export const formatDate = (dateString) => {
//   if (!dateString) return "-";
//   const date = new Date(dateString);
//   return date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "long",
//     year: "numeric",
//   });
// };

export const formatDateTime = (dateString, showTime = true) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  const options = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(showTime && {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };

  let formatted = date.toLocaleString("en-GB", options);

  if (!showTime) return formatted;

  // kalau showTime true, tambahkan "at" di antara date & time
  const [dayMonthYear, time] = formatted.split(", ");
  return `${dayMonthYear} at ${time}`;
};

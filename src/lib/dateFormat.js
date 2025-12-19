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

  const dateOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const formattedDate = date.toLocaleDateString("en-GB", dateOptions);

  if (!showTime) return formattedDate;

  const formattedTime = date.toLocaleTimeString("en-GB", timeOptions);
  return `${formattedDate} at ${formattedTime}`;
};


import Cookies from "js-cookie";
import { useEffect, useState } from "react";

// export const useCookie = (cookieName) => {
//   const [cookieValue, setCookieValue] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (typeof document !== "undefined") {
//       const match = document.cookie.match(
//         new RegExp("(^| )" + cookieName + "=([^;]+)")
//       );
//       setCookieValue(match ? match[2] : null);
//       setLoading(false);
//     }
//   }, [cookieName]);

//   return { cookieValue, loading };
// };
const domain = "www.smoebatam.com";

const useCookie = (key) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const cookieValue = Cookies.get(key);
    setValue(cookieValue);
  }, [key]);

  return value;
};

export { useCookie };

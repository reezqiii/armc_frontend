import Cookies from "js-cookie";
import { useEffect, useState } from "react";
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

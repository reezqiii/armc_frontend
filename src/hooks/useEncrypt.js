import CryptoJS from "crypto-js";
import { useCallback } from "react";

const useEncrypt = () => {
  const secretKeyBase64 = "ZWRlYmEzMzI4ZWM2YzFhM2JkODc1YjU2YmIxMjJlM2M=";
  const secretKey = CryptoJS.enc.Base64.parse(secretKeyBase64);

  const encrypt = useCallback(
    (data) => {
      if (!data) {
        throw new Error("Data to encrypt cannot be empty.");
      }
      const encrypted = CryptoJS.AES.encrypt(data, secretKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });

      const safe_encrypt = encrypted
        .toString()
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      return safe_encrypt.toString();
    },
    [secretKey],
  );

  return { encrypt };
};

export default useEncrypt;

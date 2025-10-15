import CryptoJS from "crypto-js";
import { useCallback } from "react";

const useDecrypt = () => {
  const secretKeyBase64 = "ZWRlYmEzMzI4ZWM2YzFhM2JkODc1YjU2YmIxMjJlM2M=";
  const secretKey = CryptoJS.enc.Base64.parse(secretKeyBase64);

  const decrypt = useCallback(
    (data) => {
      if (!data) {
        throw new Error("Data to encrypt cannot be empty.");
      }

      const standardBase64  = data.replace(/-/g, '+').replace(/_/g, '/');
      const paddingNeeded   = (4 - (standardBase64.length % 4)) % 4;
      const paddedBase64    = standardBase64 + '='.repeat(paddingNeeded);

      const bytes = CryptoJS.AES.decrypt(paddedBase64, secretKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });

      return bytes.toString(CryptoJS.enc.Utf8); 
    },
    [secretKey]
  );

  return { decrypt };
};

export default useDecrypt;

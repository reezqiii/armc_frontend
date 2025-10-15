import { useEffect, useState } from "react"
import Swal from "sweetalert2";

const useSwal = () => {
  const showAlert = (title, icon, text, confirmButtonText) => {
    return Swal.fire({
      title: title || 'Default Title',
      icon: icon || 'info',
      text: text || '',
      confirmButtonText: confirmButtonText || 'OK',
    });
  };

  return { showAlert };
};

export default useSwal;

import Swal from "sweetalert2";

const useSwal = () => {
  const showAlert = (
    title,
    icon,
    text,
    confirmButtonText,
    showCancel = false,
  ) => {
    return Swal.fire({
      title: title || "Default Title",
      icon: icon || "info",
      text: text || "",
      confirmButtonText: confirmButtonText || "OK",
      showCancelButton: showCancel,
      cancelButtonText: "Cancel",
    });
  };

  return { showAlert };
};

export default useSwal;

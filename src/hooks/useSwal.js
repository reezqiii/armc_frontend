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
      showClass: { popup: "" },
      hideClass: { popup: "" },
    });
  };

  const showConfirm = (title, text, confirmButtonText = "Yes, Confirm!") => {
    return Swal.fire({
      title: title || "Are you sure?",
      text: text || "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: confirmButtonText,
      cancelButtonText: "Cancel",
      showClass: { popup: "" },
      hideClass: { popup: "" },
    });
  };

  return { showAlert, showConfirm };
};

export default useSwal;

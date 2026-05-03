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

  const showInput = (
    title,
    inputLabel,
    inputPlaceholder,
    confirmButtonText = "Submit",
  ) => {
    return Swal.fire({
      title: title,
      input: "textarea",
      inputLabel: inputLabel,
      inputPlaceholder: inputPlaceholder,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#808080",
      confirmButtonText: confirmButtonText,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write a reason!";
        }
      },
      showClass: { popup: "" },
      hideClass: { popup: "" },
    });
  };

  const showLoading = (title = "Processing...") => {
    Swal.fire({
      title: title,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      showClass: { popup: "" },
      hideClass: { popup: "" },
    });
  };

  const closeSwal = () => {
    Swal.close();
  };

  return { showAlert, showConfirm, showInput, showLoading, closeSwal };
};

export default useSwal;

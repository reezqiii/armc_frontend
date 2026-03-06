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

  // Tambahkan fungsi konfirmasi ini
  const showConfirm = (title, text) => {
    return Swal.fire({
      title: title || 'Are you sure?',
      text: text || '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout!'
    });
  };

  return { showAlert, showConfirm };
};

export default useSwal;
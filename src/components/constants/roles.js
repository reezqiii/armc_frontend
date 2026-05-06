// file: src/constants/roles.js

export const ROLES = {
  ADMIN: "Administrator", // <-- Ubah dari "admin" menjadi "Administrator"
  REQUESTOR: "Requestor", // <-- Asumsi jika requestor pakai huruf besar
  HOD: "HOD",             // <-- Asumsi jika hod pakai huruf besar
};

export const ROLE_GROUPS = {
  CAN_ACCESS_REQUEST: [ROLES.ADMIN, ROLES.HOD, ROLES.REQUESTOR],
  CAN_ACCESS_PRODUCTION: [ROLES.ADMIN, ROLES.HOD],
};
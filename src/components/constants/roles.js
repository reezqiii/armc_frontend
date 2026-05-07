// file: src/constants/roles.js

export const ROLES = {
  ADMIN: "Administrator",
  REQUESTOR: "Requestor",
  HOD: "HOD",
};

export const ROLE_GROUPS = {
  CAN_ACCESS_REQUEST: [ROLES.ADMIN, ROLES.HOD, ROLES.REQUESTOR],
  CAN_ACCESS_PRODUCTION: [ROLES.ADMIN, ROLES.HOD],
};

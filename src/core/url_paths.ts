export const API_V1 = "/api/v1";

export const ENDPOINTS = {
  auth: {
    login: `${API_V1}/login/`,
    refresh: `${API_V1}/token/refresh/`,
    google: `${API_V1}/auth/google/`,
  },
  profile: `${API_V1}/me/`,
  schools: `${API_V1}/schools/`,
  institutes: `${API_V1}/institutes/`,
  programs: `${API_V1}/programs/`,
  users: `${API_V1}/users/`,
  systems: `${API_V1}/systems/`,
  userSystems: `${API_V1}/user-systems/`,
  students: `${API_V1}/students/`,
  collectionCategories: `${API_V1}/collection-categories/`,
  fees: `${API_V1}/fees/`,
  attendanceEvents: `${API_V1}/attendance-events/`,
  attendanceRecords: `${API_V1}/attendance-records/`,
  attendanceEventSettings: `${API_V1}/attendance-event-settings/`,
  payments: `${API_V1}/payments/`,
  paymentSubmissions: `${API_V1}/payment_submissions/`,
  cloudinary: `${API_V1}/cloudinary/`,
};
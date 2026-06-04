import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const UPLOAD_URL =
  process.env.REACT_APP_UPLOAD_URL || "http://localhost:5000";
export const imgSrc = (p) => (p ? `${UPLOAD_URL}${p}` : null);

export const authAPI = {
  register: (d) => api.post("/auth/register", d),
  login: (d) => api.post("/auth/login", d),
  getMe: () => api.get("/auth/me"),
  updateProfile: (d) => api.put("/auth/profile", d),
  changePassword: (d) => api.put("/auth/password", d),
};

export const usersAPI = {
  getAll: (p) => api.get("/users", { params: p }),
  getById: (id) => api.get(`/users/${id}`),
  create: (d) => api.post("/users", d),
  update: (id, d) => api.put(`/users/${id}`, d),
  remove: (id) => api.delete(`/users/${id}`),
  toggle: (id) => api.patch(`/users/${id}/toggle`),
};

export const agencesAPI = {
  getAll: () => api.get("/agences"),
  getById: (id) => api.get(`/agences/${id}`),
  create: (d) => api.post("/agences", d),
  update: (id, d) => api.put(`/agences/${id}`, d),
  remove: (id) => api.delete(`/agences/${id}`),
};
export const UPLOAD = process.env.REACT_APP_UPLOAD_URL || 'http://localhost:5000';
export const imgUrl = (p) => p ? `${UPLOAD}${p}` : null;
export const carsAPI = {
  getPublic: (p) => api.get("/cars/public", { params: p }),
  getAll: (p) => api.get("/cars", { params: p }),
  getById: (id) => api.get(`/cars/${id}`),
  checkAvail: (id, s, e) =>
    api.get(`/cars/${id}/availability`, { params: { start: s, end: e } }),
  create: (fd) =>
    api.post("/cars", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, fd) =>
    api.put(`/cars/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  remove: (id) => api.delete(`/cars/${id}`),
  toggle: (id) => api.patch(`/cars/${id}/toggle`),
};

export const reservationsAPI = {
  getOptions: () => api.get("/reservations/options"),
  create: (d) => api.post("/reservations", d),
  getMine: () => api.get("/reservations/mine"),
  getManage: (p) => api.get("/reservations/manage", { params: p }),
  getStats: () => api.get("/reservations/stats"),
  getById: (id) => api.get(`/reservations/${id}`),
  updateStatus: (id, s) => api.put(`/reservations/${id}/status`, { status: s }),
  cancelMine: (id) => api.put(`/reservations/${id}/cancel`),
  pay: (id) => api.post(`/reservations/${id}/pay`),
  uploadPhotos: (id, fd, t) =>
    api.post(`/reservations/${id}/photos?type=${t}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default api;

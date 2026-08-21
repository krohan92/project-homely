import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = {
  list: (res) => axios.get(`${API}/${res}`).then((r) => r.data),
  create: (res, body) => axios.post(`${API}/${res}`, body).then((r) => r.data),
  update: (res, id, body) => axios.patch(`${API}/${res}/${id}`, body).then((r) => r.data),
  remove: (res, id) => axios.delete(`${API}/${res}/${id}`).then((r) => r.data),
  catchup: () => axios.get(`${API}/insights/catchup`).then((r) => r.data),
};

export const today = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

export const money = (n) =>
  Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

client.interceptors.request.use((config) => {
  const storedAuth = localStorage.getItem("menswear-auth");
  if (storedAuth) {
    const { token } = JSON.parse(storedAuth);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;

import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

const API_URL = "https://auth-test-hxk7.onrender.com";

// ── بدون مصادقة (رفع الترخيص قبل التسجيل) ──
export const publicApi = axios.create({ baseURL: API_URL });

// ── Hook للطلبات المحمية ──
export function useApi() {
  const { getToken } = useAuth();

  const request = async (method, url, data = null, config = {}) => {
    const token = await getToken();
    return axios({
      method,
      url: `${API_URL}${url}`,
      data,
      ...config,
      headers: {
        Authorization: `Bearer ${token}`,
        ...config.headers,
      },
    });
  };

  return {
    get: (url, config) => request("GET", url, null, config),
    post: (url, data, config) => request("POST", url, data, config),
    put: (url, data, config) => request("PUT", url, data, config),
    patch: (url, data, config) => request("PATCH", url, data, config),
    delete: (url, config) => request("DELETE", url, null, config),
  };
}

// ── رفع ملف الترخيص (قبل التسجيل، بدون token) ──
export async function uploadLicense(file, type = "doctor") {
  const formData = new FormData();
  formData.append("license", file);

  const endpoint =
    type === "doctor"
      ? "/api/upload/doctor-license"
      : "/api/upload/pharmacy-license";

  const res = await publicApi.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      const percent = Math.round((e.loaded * 100) / e.total);
      return percent;
    },
  });

  return res.data.data.url;
}

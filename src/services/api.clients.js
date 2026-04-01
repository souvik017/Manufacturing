// api.client.js
import axios from "axios";
import { enviornment, URLs } from "./api.enviroments";

// ✅ STATIC TOKEN (set here once)
const STATIC_TOKEN =
  "qiRhsTmWq3cp5m6XfC2GgeHTK54Vb45PjEdTqaoTdtmmH39Pw16BszjHxeBGwOmg";

// Base Axios config
const axiosConfig = {
  baseURL: URLs[enviornment].apiURL,
  headers: {
    "Content-Type": "application/json",
  },
};

// Create instances
export const baseClient = axios.create(axiosConfig);
export const authClient = axios.create(axiosConfig);

// Apply interceptors
const applyInterceptors = (client) => {
  client.interceptors.request.use(
    (config) => {
      // ✅ ALWAYS attach static token
      config.headers.Authorization = `Bearer ${STATIC_TOKEN}`;

      console.log("📤 [REQUEST]");
      console.log(`➡️ URL: ${config.baseURL}${config.url}`);
      console.log(`🔁 Method: ${config.method?.toUpperCase()}`);
      console.log("🧾 Headers:", config.headers);

      if (config.data) {
        console.log("📦 Payload:", config.data);
      }

      return config;
    },
    (error) => {
      console.error("🛑 [REQUEST ERROR]", error);
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      console.log("✅ [RESPONSE]");
      console.log(`⬅️ URL: ${response.config.baseURL}${response.config.url}`);
      console.log(`📊 Status: ${response.status}`);
      console.log("📥 Data:", response.data);
      return response;
    },
    (error) => {
      if (error.response) {
        console.error("❌ [ERROR RESPONSE]");
        console.error(
          `URL: ${error.config?.baseURL}${error.config?.url}`
        );
        console.error(`Status: ${error.response.status}`);
        console.error("Error Data:", error.response.data);

        if (error.response.status === 401) {
          console.warn("⚠️ Unauthorized (401) - Token issue.");
        }
      } else if (error.request) {
        console.error("⚠️ [NO RESPONSE]");
        console.error("Request:", error.request);
      } else {
        console.error("🚨 [REQUEST SETUP ERROR]");
        console.error("Message:", error.message);
      }

      return Promise.reject(error);
    }
  );
};

// Apply to both clients
applyInterceptors(baseClient);
applyInterceptors(authClient);

export default {
  baseClient,
  authClient,
};
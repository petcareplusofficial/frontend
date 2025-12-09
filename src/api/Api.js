import axios from "axios";
const BASE_URL = "http://localhost:4000/api/v1/petcare";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `${token}`;
  }
  return config;
});

class APIClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async request(method, data = {}, params = {}, headers = {}) {
    return axiosInstance({
      url: this.endpoint,
      method,
      data: ["post", "put"].includes(method) ? data : undefined,
      params: ["get", "delete"].includes(method) ? params : undefined,
      headers,
    }).then((res) => res.data);
  }

  get(params = {}, headers = {}) {
    return this.request("get", {}, params, headers);
  }

  delete(params = {}, headers = {}) {
    return this.request("delete", {}, params, headers);
  }

  post(data = {}, params = {}, headers = {}) {
    return this.request("post", data, params, headers);
  }

  put(data = {}, params = {}, headers = {}) {
    return this.request("put", data, params, headers);
  }
}

export default APIClient;

// useEffect(() => {
//   // Async function inside useEffect
//   const login = async () => {
//     try {
//       const authAPI = new APIClient("/pets");
//       const response = await authAPI.post({
//         email: "kumara@gmail.com",
//         password: "kumara123",
//       });
//       console.log("Login response:", response);

//       // Optionally store token for future requests
//       if (response.token) {
//         localStorage.setItem("token", response.token);
//       }
//     } catch (err) {
//       console.error("Login error:", err.response?.data || err.message);
//     }
//   };

//   login(); // call it once when component mounts
// }, []);

// api/Api.js

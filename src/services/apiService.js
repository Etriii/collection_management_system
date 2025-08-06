import axios from "axios";

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Optional: interceptors for auth tokens
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token"); //sa redis rata mag store ani para secure. kundi cache nalang
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // GET request
  async get(endpoint, params = {}) {
    try {
      const res = await this.api.get(endpoint, { params });
      return res.data;
    } catch (err) {
      this._handleError(err);
    }
  }

  // POST request
  async post(endpoint, body = {}) {
    try {
      const res = await this.api.post(endpoint, body);
      return res.data;
    } catch (err) {
      this._handleError(err);
    }
  }

  // PUT request
  async put(endpoint, body = {}) {
    try {
      const res = await this.api.put(endpoint, body);
      return res.data;
    } catch (err) {
      this._handleError(err);
    }
  }

  // DELETE request
  async delete(endpoint) {
    try {
      const res = await this.api.delete(endpoint);
      return res.data;
    } catch (err) {
      this._handleError(err);
    }
  }

}

export default new ApiService();
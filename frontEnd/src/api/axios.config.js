import axios from "axios";

/**
 * Axios instance
 */
const Axios = axios.create({
  baseURL:"https://bingoarenagame-2.onrender.com",
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

export default Axios;
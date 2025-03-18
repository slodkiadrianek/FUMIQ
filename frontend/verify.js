import { baser_url } from "./base_api.js";
async function verifyUser() {
  // Access environment variables
  const token = sessionStorage.getItem("authToken");
  const response = await fetch(`http://${baser_url}/api/v1/auth/check`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const responseData = await response.json();
  if (!responseData.success) {
    location.href = "login.html";
  }
}
verifyUser();

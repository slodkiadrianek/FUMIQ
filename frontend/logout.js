import { base_url } from "./base_api.js";

async function handleLogout() {
  try {
    await logout();
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout failed:", error);
    alert("Logout failed. Please try again.");
  }
}
handleLogout();
async function logout() {
  const token = sessionStorage.getItem("authToken");
  await fetch(
    `http://${base_url}/api/v1/auth/logout
`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

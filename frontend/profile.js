// Fetch user data from an API
import { base_url } from "./base_api.js";
async function fetchUserData() {
  try {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const token = sessionStorage.getItem("authToken");
    const response = await fetch(
      `http://${base_url}/api/v1/users/${userData.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    ); // Replace with your API endpoint
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

// Update the profile card with fetched data
async function updateProfile() {
  const userData = await fetchUserData();
  if (userData) {
    const date = new Date(userData.data.user.createdAt);
    document.getElementById(
      "userName"
    ).textContent = `${userData.data.user.firstname} ${userData.data.user.lastname}`;
    document.getElementById("userEmail").textContent = userData.data.user.email;
    document.getElementById("joinDate").textContent = `${date.getFullYear()}-${
      date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    }-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`;
  }
}

// Initialize the page
async function init() {
  await updateProfile();
}
await fetchUserData();

// Run the initialization function
init();

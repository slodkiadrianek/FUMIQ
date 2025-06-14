import { base_url } from "./base_api.js";
document.addEventListener("DOMContentLoaded", function () {
  // Get user ID from URL or local storage
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const token = sessionStorage.getItem("authToken");
  const errorAlert = document.getElementById("error-alert");
  const successAlert = document.getElementById("success-alert");
  const saveBtn = document.getElementById("save-profile-btn");
  const form = document.getElementById("edit-profile-form");

  // Load current profile data
  async function loadProfileData() {
    try {
      const response = await fetch(
        `http://${base_url}/api/v1/users/${userData.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { data } = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load profile");
      }
      // Populate form fields
      document.getElementById("firstName").value = data.user.firstname || "";
      document.getElementById("lastName").value = data.user.lastname || "";
      document.getElementById("email").value = data.user.email || "";
    } catch (error) {
      errorAlert.textContent = error.message || "Failed to load profile data";
      errorAlert.classList.remove("d-none");
    }
  }

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Hide alerts
    errorAlert.classList.add("d-none");
    successAlert.classList.add("d-none");

    // Get form values
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;

    try {
      saveBtn.disabled = true;
      saveBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

      // Send request to backend
      const response = await fetch(
        `http://${base_url}/api/v1/users/${userData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstname: firstName,
            lastname: lastName,
            email,
          }),
        }
      );

      if (response.status !== 204) {
        const data = await response.json();

        throw new Error(data.message || "Failed to update profile");
      }

      // Show success message
      successAlert.textContent = "Profile updated successfully!";
      successAlert.classList.remove("d-none");

      // Optionally redirect after success
      window.location.href = "profile.html";
    } catch (error) {
      errorAlert.textContent =
        error.message || "An error occurred while updating profile.";
      errorAlert.classList.remove("d-none");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Changes";
    }
  });

  // Load profile data when page loads
  loadProfileData();
});

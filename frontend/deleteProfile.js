import { base_url } from "./base_api.js";
document.addEventListener("DOMContentLoaded", function () {
  // Get user ID from URL or local storage (adjust as needed)
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  console.log(userData);
  // Get user ID from URL or local storage (adjust as needed)
  const userId = userData.id;
  console.log(userId);

  // Password toggle functionality
  const toggleIcon = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  toggleIcon.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleIcon.classList.remove("bi-eye-slash");
      toggleIcon.classList.add("bi-eye");
    } else {
      passwordInput.type = "password";
      toggleIcon.classList.remove("bi-eye");
      toggleIcon.classList.add("bi-eye-slash");
    }
  });

  // Handle form submission
  document
    .getElementById("delete-profile-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const errorAlert = document.getElementById("error-alert");
      const successAlert = document.getElementById("success-alert");
      const deleteBtn = document.getElementById("delete-profile-btn");

      // Hide alerts
      errorAlert.classList.add("d-none");
      successAlert.classList.add("d-none");

      // Get form values
      const password = document.getElementById("password").value;
      const isConfirmed = document.getElementById("confirmDelete").checked;

      // Validate confirmation
      if (!isConfirmed) {
        errorAlert.textContent =
          "You must confirm the deletion by checking the box.";
        errorAlert.classList.remove("d-none");
        return;
      }

      try {
        deleteBtn.disabled = true;
        deleteBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...';
        const token = sessionStorage.getItem("authToken");

        // Send request to backend
        const response = await fetch(
          `http://${base_url}/api/v1/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Adjust as needed
            },
            body: JSON.stringify({
              password,
            }),
          }
        );

        const data = await response.json();

        if (!response.status === 204) {
          throw new Error(data.message || "Failed to delete profile");
        }

        // Show success message
        successAlert.textContent =
          data.message || "Your profile has been deleted successfully.";
        successAlert.classList.remove("d-none");

        // Clear local storage and redirect
        localStorage.clear();
        setTimeout(() => {
          window.location.href = "register.html";
        }, 2000);
      } catch (error) {
        errorAlert.textContent =
          error.message || "An error occurred while deleting your profile.";
        errorAlert.classList.remove("d-none");
      } finally {
        deleteBtn.disabled = false;
        deleteBtn.textContent = "Permanently Delete My Account";
      }
    });
});

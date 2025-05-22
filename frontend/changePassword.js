import { base_url } from "./base_api.js";
document.addEventListener("DOMContentLoaded", function () {
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  console.log(userData);
  // Get user ID from URL or local storage (adjust as needed)
  const userId = userData.id;
  console.log(userId);
  // Password toggle functionality
  const togglePassword = (inputId, toggleId) => {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(toggleId);

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
  };

  // Initialize password toggles
  togglePassword("oldPassword", "toggleOldPassword");
  togglePassword("newPassword", "toggleNewPassword");
  togglePassword("confirmPassword", "toggleConfirmPassword");

  // Handle form submission
  document
    .getElementById("change-password-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const errorAlert = document.getElementById("error-alert");
      const successAlert = document.getElementById("success-alert");
      const changePasswordBtn = document.getElementById("change-password-btn");

      // Hide alerts
      errorAlert.classList.add("d-none");
      successAlert.classList.add("d-none");

      // Get form values
      const oldPassword = document.getElementById("oldPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Validate passwords
      if (newPassword !== confirmPassword) {
        errorAlert.textContent = "New passwords do not match.";
        errorAlert.classList.remove("d-none");
        return;
      }

      if (newPassword.length < 8) {
        errorAlert.textContent = "Password must be at least 8 characters long.";
        errorAlert.classList.remove("d-none");
        return;
      }

      try {
        changePasswordBtn.disabled = true;
        changePasswordBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Changing...';
        const token = sessionStorage.getItem("authToken");

        // Send request to backend
        const response = await fetch(
          `http://${base_url}/api/v1/users/${userId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Adjust as needed
            },
            body: JSON.stringify({
              oldPassword,
              newPassword,
              confirmPassword,
            }),
          }
        );

        if (!response.status === 204) {
          const data = await response.json();

          throw new Error(data.message || "Failed to change password");
        }

        // Show success message
        successAlert.textContent = "Password changed successfully!";
        successAlert.classList.remove("d-none");

        // Clear form
        document.getElementById("change-password-form").reset();

        // Optionally redirect after success
        // setTimeout(() => {
        //     window.location.href = 'profile.html';
        // }, 2000);
      } catch (error) {
        errorAlert.textContent =
          error.message || "An error occurred while changing password.";
        errorAlert.classList.remove("d-none");
      } finally {
        changePasswordBtn.disabled = false;
        changePasswordBtn.textContent = "Change Password";
      }
    });
});

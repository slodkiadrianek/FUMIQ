import { base_url } from "./base_api.js";

// DOM Elements
const messageContainer = document.getElementById("message-container");
const resetForm = document.getElementById("resetPasswordForm");
const submitBtn = document.getElementById("submitBtn");
const resetToken = document.getElementById("resetToken");

// Initialize the application
function initPasswordReset() {
  const token = getTokenFromUrl();

  if (!token) {
    showMessage(
      "Invalid password reset link. Please request a new one.",
      "danger"
    );
    disableForm();
    return;
  }

  resetToken.value = token;
  setupFormSubmitHandler();
}

// Get token from URL query parameters
function getTokenFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("token");
}

// Set up form submission handler
function setupFormSubmitHandler() {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleFormSubmit();
  });
}
let newPassword;
let confirmPassword;
// Handle form submission
async function handleFormSubmit() {
  newPassword = document.getElementById("newPassword").value;
  confirmPassword = document.getElementById("confirmPassword").value;

  if (!validatePasswords(newPassword, confirmPassword)) {
    return;
  }

  try {
    toggleLoadingState(true);
    await sendResetRequest(newPassword);
  } catch (error) {
    console.error("Error:", error);
    showMessage(
      error.message || "An error occurred during the action",
      "danger"
    );
  } finally {
    toggleLoadingState(false);
  }
}

// Validate password fields
function validatePasswords(newPassword, confirmPassword) {
  if (newPassword !== confirmPassword) {
    showMessage("Passwords do not match.", "danger");
    return false;
  }

  if (newPassword.length < 8) {
    showMessage("Password must be at least 8 characters long.", "danger");
    return false;
  }

  return true;
}

// Send reset request to API
async function sendResetRequest(newPassword) {
  try {
    const API_URL = `http://${base_url}/api/v1/auth/reset-password/${resetToken.value}`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: newPassword,
        confirmPassword: confirmPassword,
      }),
    });

    if (response.status !== 204) {
      const data = await response.json();
      throw new Error(data.error.description || "Failed to reset password");
    } else {
      showMessage(
        "Password reset successfully! Redirecting to login...",
        "success"
      );
      setTimeout(() => {
        window.location.href = "login.html";
      }, 3000);
    }
  } catch (error) {
    showMessage(error.message, "danger");
    throw error;
  }
}

// Show message to user
function showMessage(message, type) {
  messageContainer.innerHTML = `
          <div class="alert alert-${type} animate__animated animate__fadeIn">
            ${message}
          </div>
        `;
}

// Toggle loading state
function toggleLoadingState(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.innerHTML = isLoading
    ? '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...'
    : "Reset Password";
}

// Disable form elements
function disableForm() {
  const formElements = resetForm.querySelectorAll("input, button");
  formElements.forEach((element) => {
    element.disabled = true;
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initPasswordReset);

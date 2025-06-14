import { base_url } from "./base_api.js";

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const statusMessage = document.getElementById("statusMessage");
  const successContent = document.getElementById("successContent");
  const errorContent = document.getElementById("errorContent");
  const activationIcon = document.querySelector(".activation-icon");

  if (!token) {
    showError(
      "Invalid activation link. Please check your email for the correct link."
    );
    return;
  }

  activateAccount(token);

  async function activateAccount(token) {
    try {
      const response = await fetch(
        `http://${base_url}/api/v1/auth/activate/${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response)
      if (response.status === 204) {
        showSuccess("Account activated successfully!");
      } else {

        showError(
          "Activation failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Activation error:", error);
      showError("Network error. Please try again later.");
    }
  }

  function showSuccess(message) {
    statusMessage.textContent = message;
    statusMessage.className = "status-message success";
    activationIcon.className =
      "bi bi-check-circle-fill activation-icon success";
    // successContent.style.display = "block";
    errorContent.style.display = "none";
  }

  function showError(message) {
    statusMessage.textContent = message;
    statusMessage.className = "status-message error";
    activationIcon.className = "bi bi-x-circle-fill activation-icon error";
    // successContent.style.display = "none";
    errorContent.style.display = "block";
  }
});

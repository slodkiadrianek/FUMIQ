import { base_url } from "./base_api.js";

const reset_form = document.getElementById("reset-form");
const errorMessage = document.getElementById("error-message");
const success_message = document.getElementById("success-message");

reset_form.addEventListener("submit", async function (event) {
  try {
    event.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch(`http://${base_url}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Specify JSON format
      },
      body: JSON.stringify(data),
    });

    if (!res.status === 204) {
      const responseData = await res.json();

      success_message.classList.add("d-none");
      errorMessage.innerHTML = responseData.error.description;
      errorMessage.classList.remove("d-none");
    } else {
      errorMessage.classList.add("d-none");
      success_message.classList.remove("d-none");
      success_message.innerHTML =
        "An email with a link to reset your password has been sent";
    }
  } catch (error) {
    console.error(error);
  }
});

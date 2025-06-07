import { base_url } from "./base_api.js";

const register_form = document.getElementById("register-form");
const errorMessage = document.getElementById("error-message");
const success_message = document.getElementById("success-message");

register_form.addEventListener("submit", async function (event) {
  try {
    event.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch(`http://${base_url}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const responseData = await res.json();
    if (!responseData.success) {
      success_message.classList.add("d-none");
      errorMessage.innerHTML = responseData.error.description;
      errorMessage.classList.remove("d-none");
    } else {
      errorMessage.classList.add("d-none");
      success_message.classList.remove("d-none");
      success_message.innerHTML =
        "Account has been created. An email with a link to activate your account has been sent.";
    }
  } catch (error) {
    console.error(error);
  }
});

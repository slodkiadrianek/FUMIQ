import { baser_url } from "./base_api.js";

const login_form = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");
const success_message = document.getElementById("success-message");

login_form.addEventListener("submit", async function (event) {
  try {
    event.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch(`http://${baser_url}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const responseData = await res.json();
    console.log("Success:", responseData);
    if (!responseData.success) {
      success_message.classList.add("d-none");
      errorMessage.innerHTML = responseData.error.description;
      errorMessage.classList.remove("d-none");
    } else {
      errorMessage.classList.add("d-none");
      sessionStorage.setItem("authToken", responseData.data.token);
      location.href = "dashboard.html";
    }
  } catch (error) {
    console.error(error);
  }
});

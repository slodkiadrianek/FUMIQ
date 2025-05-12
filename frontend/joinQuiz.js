import { base_url } from "./base_api.js";

const btnJoin = document.getElementById("join");
const errorMessage = document.getElementById("error-message");
console.log(errorMessage);
async function joinQuiz() {
  const token = sessionStorage.getItem("authToken");
  const code = document.getElementById("code").value;
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const response = await fetch(
    `http://${base_url}/api/v1/users/${userData.id}/sessions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        code,
      }),
    }
  );

  const responseData = await response.json();
  if (!responseData.success) {
    errorMessage.classList.remove("d-none");
    errorMessage.innerHTML = responseData.error.description;
  } else {
    errorMessage.classList.add("d-none");
    window.location.href = `/sessionQuiz.html?sessionId=${responseData.data.quiz._id}`;
  }
}

btnJoin.addEventListener("click", (e) => {
  e.preventDefault();
  joinQuiz();
});

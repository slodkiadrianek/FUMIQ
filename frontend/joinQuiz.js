import { base_url } from "./base_api.js";

const btnJoin = document.getElementById("join");
const errorMessage = document.getElementById("error-message");
console.log(errorMessage);
async function joinQuiz() {
  const token = sessionStorage.getItem("authToken");
  const code = document.getElementById("code").value;
  const userId = sessionStorage.getItem("userId");
  const response = await fetch(
    `http://${base_url}/api/v1/users/${userId}/session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        code,
      }),
    },
  );

  const responseData = await response.json();
  console.log(responseData);
  if (!responseData.success) {
    errorMessage.classList.remove("d-none");
    errorMessage.innerHTML = "Test with this code does not exist!!!";
  } else {
    errorMessage.classList.add("d-none");
    window.location.href = `/takeQuiz.html?quizId=${quizId}`;
  }
}

btnJoin.addEventListener("click", (e) => {
  e.preventDefault();
  joinQuiz();
});

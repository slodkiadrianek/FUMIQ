import { base_url } from "./base_api.js";
document.addEventListener("DOMContentLoaded", async function () {
  // This would typically come from your API
  let quizScore = 0; // Replace with actual score

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("sessionId");
  // Update the score display
  const scoreCircle = document.querySelector(".score-display");
  const scorePercent = document.getElementById("scorePercent");

  scoreCircle.style.background = `
                    conic-gradient(
                        var(--primary-color) 0% ${quizScore}%,
                        var(--light-bg) ${quizScore}% 100%
                    )
                `;
  scorePercent.textContent = `${quizScore}%`;
  try {
    const token = sessionStorage.getItem("authToken");
    let userData = JSON.parse(sessionStorage.getItem("userData"));
    const response = await fetch(
      `http://${base_url}/api/v1/users/${userData.id}/sessions/${sessionId}/results`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log(response);
    const responseData = await response.json();
    if (responseData.success) {
      console.log(responseData);
      quizScore = responseData.data.score;
      scorePercent.textContent = `${quizScore}%`;
    } else {
      throw new Error(requestData.error.description);
    }
  } catch (error) {
    console.error("Submission error:", error);
    alert("Error during showing results. Please try again.");
  }
});

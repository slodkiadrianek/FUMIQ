import { base_url } from "./base_api.js";

document.addEventListener("DOMContentLoaded", function () {
  fetchQuizAnalytics();
});

async function fetchQuizAnalytics() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("sessionId");
    const quizId = urlParams.get("quizId");
    const token = sessionStorage.getItem("authToken");
    const response = await fetch(
      `http://${base_url}/api/v1/quizzes/${quizId}/sessions/${sessionId}/analytics`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    console.log(data);
    if (!response.ok) {
      throw new Error(
        data.error ? data.error.description : "Failed to fetch data"
      );
      return;
    }
    updateQuizAnalytics(data.data.session);
  } catch (error) {
    console.error("Error fetching quiz analytics:", error);
  }
}

function updateQuizAnalytics(data) {
  // Update header info
  document.getElementById("quiz-title").textContent = data.quizTitle;
  document.getElementById("quiz-description").textContent =
    data.quizDescription;
  document.getElementById(
    "average-score"
  ).textContent = `${data.averageScore}%`;
  document.getElementById(
    "highest-score"
  ).textContent = `${data.highestScore}%`;

  // Create question cards
  const questionsContainer = document.getElementById("questions-container");
  questionsContainer.innerHTML = "";

  data.questions.forEach((question, index) => {
    const questionCard = document.createElement("div");
    questionCard.className = `question-card animate__animated animate__fadeInUp animate__delay-${
      index + 1
    }s`;

    let questionHTML = `
            <h3 class="question-text">Question ${index + 1}: ${
      question.questionText
    }</h3>
            <ul class="options-list">
          `;
    if (question.options.length === 0) {
      questionHTML += `<li class="no-options">It is open-ended question.</li>`;
      questionHTML += `</ul>`;
      questionCard.innerHTML = questionHTML;
      questionsContainer.appendChild(questionCard);
      return;
    }
    question.options.forEach((option) => {
      const correctClass = option.isCorrect ? "correct-option" : "";
      questionHTML += `
              <li class="option-item ${correctClass}">
                <div class="percentage-bar" style="width: ${option.percentage}%"></div>
                <div class="option-text">
                  <span>${option.optionText}</span>
                  <span class="option-percentage">${option.percentage}%</span>
                </div>
              </li>
            `;
    });

    questionHTML += `</ul>`;
    questionCard.innerHTML = questionHTML;
    questionsContainer.appendChild(questionCard);
  });
}

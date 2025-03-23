import { base_url } from "./base_api.js";
// Mock data for the active quiz (replace with API call)
let data;
async function startQuiz() {
  const token = sessionStorage.getItem("authToken");

  const testId = new URLSearchParams(window.location.search).get("id");
  if (!testId) {
    alert("Test ID not found.");
    return;
  }

  const response = await fetch(
    `http://${base_url}/api/v1/quizez/${testId}/session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const responseData = await response.json();
  if (!responseData.success) {
    alert("Error");
  }
  return responseData.data.quiz;
}
data = await startQuiz();
console.log(data);
const activeQuiz = {
  userId: data.userId,
  quizId: data.quizId,
  code: data.code,
  isActive: data.isActive,
  competitors: [
    {
      userId: "67d87b5d8e3b8f3594f35d73",
      firstName: "John",
      lastName: "Doe",
      answers: [
        {
          question: "2+2=?",
          answer: "4",
          correct: true,
        },
        {
          question: "2+3=?",
          answer: "5",
          correct: true,
        },
      ],
      finished: true,
    },
    {
      userId: "67d87b5d8e3b8f3594f35d74",
      firstName: "Jane",
      lastName: "Smith",
      answers: [
        {
          question: "2+2=?",
          answer: "5",
          correct: false,
        },
        {
          question: "2+3=?",
          answer: "6",
          correct: false,
        },
      ],
      finished: false,
    },
  ],
};

// Function to render the active quiz
function renderActiveQuiz() {
  const quizContainer = document.getElementById("active-quiz");
  quizContainer.innerHTML = "";

  if (!activeQuiz) {
    quizContainer.innerHTML = `<p class="text-center">No active quiz at the moment.</p>`;
    return;
  }

  const quizCard = document.createElement("div");
  quizCard.className = "quiz-card animate__animated animate__fadeIn";

  quizCard.innerHTML = `
          <div class="quiz-info">
            <i class="bi bi-file-earmark-text"></i>
            <div>
              <h4>Quiz Code: ${activeQuiz.code}</h4>
              <p>Status: ${activeQuiz.isActive ? "Active" : "Inactive"}</p>
            </div>
          </div>
          <div class="competitors-list">
            <h5>Competitors:</h5>
            <ul>
              ${activeQuiz.competitors
                .map(
                  (competitor) => `
                <li>
                  <div class="competitor-info">
                    <h6>${competitor.firstName} ${competitor.lastName}</h6>
                    <span class="status ${
                      competitor.finished ? "finished" : ""
                    }">
                      ${competitor.finished ? "Finished" : "In Progress"}
                    </span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress" style="width: ${
                      (competitor.answers.length / 2) * 100
                    }%"></div>
                  </div>
                  <div class="answers-list">
                    <ul>
                      ${competitor.answers
                        .map(
                          (answer) => `
                        <li class="${answer.correct ? "correct" : "incorrect"}">
                          <strong>Question:</strong> ${answer.question}<br>
                          <strong>Answer:</strong> ${answer.answer}
                        </li>
                      `,
                        )
                        .join("")}
                    </ul>
                  </div>
                </li>
              `,
                )
                .join("")}
            </ul>
          </div>
        `;

  quizContainer.appendChild(quizCard);
}

// Render the active quiz on page load
renderActiveQuiz();

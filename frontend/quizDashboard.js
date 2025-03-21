import { base_url } from "./base_api.js";
// Mock data for the active quiz (replace with API call)

async function startQuiz() {
    const token = sessionStorage.getItem("authToken")
    const response = await fetch(`http://${base_url}/api/v1/quiz/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
}

const activeQuiz = {
  userId: "67d87b5d8e3b8f3594f35d72",
  quizId: "67dc3345cef44c8922b289aa",
  code: "QUIZ123",
  isActive: true,
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
                      `
                        )
                        .join("")}
                    </ul>
                  </div>
                </li>
              `
                )
                .join("")}
            </ul>
          </div>
        `;

  quizContainer.appendChild(quizCard);
}

// Render the active quiz on page load
renderActiveQuiz();

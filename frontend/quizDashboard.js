import { base_url } from "./base_api.js";

// Socket.io connection
const socket = io("http://127.0.0.1:3000");
socket.on("connect", () => console.log("Connected!"));

let quizData = {
  totalQuestions: 0, // Will be populated from API
  competitors: [],
};

// Initialize quiz data
let sessionId;
async function initializeQuiz() {
  const token = sessionStorage.getItem("authToken");
  const testId = new URLSearchParams(window.location.search).get("id");

  if (!testId) {
    alert("Test ID not found.");
    return;
  }

  try {
    // Get quiz session data
    const sessionResponse = await fetch(
      `http://${base_url}/api/v1/quizez/${testId}/session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const sessionData = await sessionResponse.json();
    sessionId = sessionData.data.quiz._id.toString();
    console.log(sessionId);
    // Get quiz details to know total questions
    const quizResponse = await fetch(
      `http://${base_url}/api/v1/quizez/${testId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },
      },
    );
    const quizDetails = await quizResponse.json();

    if (sessionData.success && quizDetails.success) {
      console.log(sessionData.data);
      quizData = {
        code: sessionData.data.quiz.code,
        isActive: sessionData.data.quiz.isActive,
        totalQuestions: quizDetails.data.quizez.questions.length,
        competitors: [],
      };
      renderActiveQuiz();
    } else {
      alert("Error loading quiz data");
    }
    // Socket event handlers
    socket.on(`newUser-${sessionId}`, (data) => {
      console.log("New user joined:", data);
      quizData.competitors.push({
        userId: data.userData.id,
        firstName: data.userData.firstname,
        lastName: data.userData.lastname,
        answers: [],
        finished: false,
      });
      renderActiveQuiz();
    });
    socket.on(`newAnswer-${sessionId}`, (data) => {
      console.log("Answer received:", data);

      // Find or create competitor
      let competitor = quizData.competitors.find(
        (c) => c.userId === data.userId,
      );

      if (!competitor) {
        competitor = {
          userId: data.userData.id,
          firstName: "Unknown",
          lastName: "User",
          answers: [],
          finished: false,
        };
        quizData.competitors.push(competitor);
      }

      // Update answers
      const existingAnswerIndex = competitor.answers.findIndex(
        (a) => a.questionId === data.questionId,
      );
      if (existingAnswerIndex >= 0) {
        competitor.answers[existingAnswerIndex].answer = data.answer;
      } else {
        competitor.answers.push({
          questionId: data.questionId,
          question: data.questionText || `Question ${data.questionId}`,
          answer: Array.isArray(data.answer)
            ? data.answer.join(", ")
            : data.answer,
        });
      }

      // Check if finished
      competitor.finished =
        competitor.answers.length >= quizData.totalQuestions;

      renderActiveQuiz();
    });
    socket.on(`submitQuiz-${sessionId}`, () => {
      competitor.finished = true;
      renderActiveQuiz();
    });
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to load quiz data");
  }
}
initializeQuiz();

// Render function
function renderActiveQuiz() {
  const quizContainer = document.getElementById("active-quiz");
  quizContainer.innerHTML = "";

  if (!quizData.code) {
    quizContainer.innerHTML = `<p class="text-center">No active quiz at the moment.</p>`;
    return;
  }

  const quizCard = document.createElement("div");
  quizCard.className = "quiz-card animate__animated animate__fadeIn";

  quizCard.innerHTML = `
    <div class="quiz-info">
      <i class="bi bi-file-earmark-text"></i>
      <div>
        <h4>Quiz Code: ${quizData.code}</h4>
        <p>Status: ${quizData.isActive ? "Active" : "Inactive"}</p>
        <p>Total Questions: ${quizData.totalQuestions}</p>
      </div>
    </div>
    <div class="competitors-list">
      <h5>Competitors (${quizData.competitors.length}):</h5>
      <ul>
        ${quizData.competitors
          .map(
            (competitor) => `
          <li>
            <div class="competitor-info">
              <h6>${competitor.firstName} ${competitor.lastName}</h6>
              <span class="status ${competitor.finished ? "finished" : ""}">
                ${competitor.finished ? "Finished" : "In Progress"}
              </span>
            </div>
            <div class="progress-bar">
              <div class="progress" style="width: ${
                quizData.totalQuestions > 0
                  ? (competitor.answers.length / quizData.totalQuestions) * 100
                  : 0
              }%"></div>
            </div>
            <div class="answers-list">
              <ul>
                ${competitor.answers
                  .map(
                    (answer) => `
                  <li>
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

// Initialize on page load

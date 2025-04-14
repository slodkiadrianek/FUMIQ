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
      `http://${base_url}/api/v1/quizez/${testId}/sessions`,
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
    console.log(quizDetails);
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
      let founded = false;
      for (const el of quizData.competitors) {
        if (el.userId === data.userData.id) {
          founded = true;
          break;
        }
      }
      if (!founded) {
        quizData.competitors.push({
          userId: data.userData.id,
          firstName: data.userData.firstname,
          lastName: data.userData.lastname,
          answers: [],
          finished: false,
        });
      }

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
      renderActiveQuiz();
    });
    socket.on(`submitQuiz-${sessionId}`, (data) => {
      for (const competitor of quizData.competitors) {
        if (competitor.userId === data.userId) {
          competitor.finished = true;
        }
      }
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
// Add JavaScript to handle quiz ending
document.addEventListener("DOMContentLoaded", function () {
  const confirmEndQuizBtn = document.getElementById("confirmEndQuiz");

  if (confirmEndQuizBtn) {
    confirmEndQuizBtn.addEventListener("click", function () {
      // Call function to end the quiz
      endQuiz();

      // Close the modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("endQuizModal"),
      );
      modal.hide();
    });
  }

  // Function to end the quiz
  async function endQuiz() {
    try {
      // Get the active quiz ID from the page or session storage
      // This would depend on how you're storing the active quiz information

      const token = sessionStorage.getItem("authToken");
      const testId = new URLSearchParams(window.location.search).get("id");
      // Make API request to end the quiz
      const response = await fetch(
        `http://${base_url}/api/v1/quizez/${testId}/sessions/${sessionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status !== 204) {
        throw new Error("Failed to end quiz");
      }
      showNotification("Quiz ended successfully!", "success");

      // Refresh the quiz display or redirect to results
      setTimeout(() => {
        window.location.href =
          "viewResults.html?sessionId=" + sessionId + "&quizId=" + testId;
      }, 1500);
    } catch (error) {
      console.error("Error in endQuiz function:", error);
      showNotification("An unexpected error occurred.", "error");
    }
  }

  // Helper function to get active quiz ID

  // Helper function to show notifications
  function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type} animate__animated animate__fadeIn`;
    notification.textContent = message;

    // Apply styles based on notification type
    if (type === "success") {
      notification.style.backgroundColor = "rgba(16, 185, 129, 0.9)";
    } else if (type === "error") {
      notification.style.backgroundColor = "rgba(239, 68, 68, 0.9)";
    }

    // Style the notification
    Object.assign(notification.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "12px 20px",
      borderRadius: "8px",
      color: "white",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      zIndex: "9999",
      maxWidth: "300px",
    });

    // Add to document
    document.body.appendChild(notification);

    // Remove after delay
    setTimeout(() => {
      notification.classList.replace("animate__fadeIn", "animate__fadeOut");
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 3000);
  }
});

// Initialize on page load

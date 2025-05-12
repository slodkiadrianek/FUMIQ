// Quiz state management
import { base_url } from "./base_api.js";
async function submitAnswers() {
  const token = sessionStorage.getItem("authToken");
  const response = await fetch(
    `http://${base_url}/api/v1/users/${userData.id}/sessions/${quizState.sessionId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  let result;
  if (response.status === 204) {
    window.location.href = `viewResult.html?sessionId=${quizState.sessionId}`;
  } else {
    result = await response.json(); // for 200 or error responses
    throw new Error(result.error.description || "Submission failed");
  }
}
let userData = JSON.parse(sessionStorage.getItem("userData"));
document.addEventListener("visibilitychange", async () => {
  if (document.hidden) {
    submitAnswers();
    socket.emit("submitQuiz", {
      userId: userData.id,
      sessionId: quizState.sessionId,
    });
  } else {
    console.log("Strona znów jest widoczna");
  }
});

// Define element references
const elements = {
  loadingState: document.getElementById("loading-state"),
  errorState: document.getElementById("error-state"),
  quizContent: document.getElementById("quiz-content"),
  questionsContainer: document.getElementById("questions-container"),
  progressText: document.getElementById("progress-text"),
  progressFill: document.getElementById("progress-fill"),
  scoreText: document.getElementById("score-text"),
  totalPointsText: document.getElementById("total-points-text"),
  timeDisplay: document.getElementById("time-display"),
  prevBtn: document.getElementById("prev-btn"),
  nextBtn: document.getElementById("next-btn"),
  saveBtn: document.getElementById("save-btn"),
  submitQuizBtn: document.getElementById("submit-quiz-btn"),
  retryBtn: document.getElementById("retry-btn"),
};

const quizState = {
  questions: [],
  title: "",
  description: "",
  currentQuestionIndex: 0,
  answers: {},
  timeLimit: 0,
  timeLeft: 0,
  timerInterval: null,
  totalPoints: 0,
  quizId: null,
  websocket: null,
  sessionId: null,
};

// Initialize the quiz
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  quizState.quizId = urlParams.get("id");
  quizState.sessionId = urlParams.get("sessionId");

  initializeWebSocket();
  loadQuiz();
  setupEventListeners();
});

// Initialize WebSocket connection
let socket;
function initializeWebSocket() {
  const token = sessionStorage.getItem("authToken");
  socket = io(base_url);
  socket.on("connect", () => console.log("Connected!"));
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  socket.emit("joinSession", { userData, sessionId: quizState.sessionId });
}

// Setup event listeners
function setupEventListeners() {
  elements.nextBtn.addEventListener("click", navigateToNextQuestion);
  elements.prevBtn.addEventListener("click", navigateToPreviousQuestion);
  elements.submitQuizBtn.addEventListener("click", showSubmitConfirmation);
  elements.retryBtn.addEventListener("click", loadQuiz);
  document
    .getElementById("confirm-submit")
    .addEventListener("click", submitQuiz);

  // Hide save button since we're using WebSocket
}

// Load quiz from API
async function loadQuiz() {
  try {
    showLoadingState();

    const token = sessionStorage.getItem("authToken");

    const response = await fetch(
      `http://${base_url}/api/v1/users/${userData.id}/sessions/${quizState.sessionId}`,
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
    if (!data.success) {
      throw new Error(data.error.description || "Failed to load quiz");
    }

    // Transform API data to our quiz state format
    const quizData = data.data.quiz.quizId;
    const sessionData = data.data.quiz.competitor;
    quizState.title = quizData.title;
    quizState.description = quizData.description;
    const endTime = new Date(data.data.quiz.competitor.startedAt);
    endTime.setMinutes(endTime.getMinutes() + quizData.timeLimit);
    if (endTime.getMinutes() + quizData.timeLimit > 60) {
      endTime.setHours(endTime.getHours() + 1);
      endTime.setMinutes(endTime.getMinutes() + quizData.timeLimit);
    }
    const actualTime = new Date();
    if (actualTime > endTime) {
      await submitAnswers();
      socket.emit("submitQuiz", {
        userId: userData.id,
        sessionId: quizState.sessionId,
      });
    }

    quizState.timeLimit =
      ((endTime.getHours() - actualTime.getHours()) * 60 +
        (endTime.getMinutes() - actualTime.getMinutes())) *
        60 +
      (endTime.getSeconds() - actualTime.getSeconds()); // Convert minutes to seconds

    // Transform questions from API format to our format
    quizState.questions = quizData.questions.map((q, index) => {
      const question = {
        id: q._id || `q${index + 1}`,
        text: q.questionText,
        points: 1, // Default points if not specified
        questionType: q.questionType,
        options: q.options
          ? q.options.map((opt, i) => ({
              id: String.fromCharCode(97 + i), // a, b, c, etc.
              text: opt,
            }))
          : [],
        photoUrl: q.photoUrl, // Add photo URL if available
      };
      return question;
    });

    quizState.timeLeft = quizState.timeLimit;

    quizState.answers = {};
    quizState.questions.forEach((q) => {
      // Check if this question has an answer in the session data
      const questionAnswer = sessionData.answers.find(
        (a) => a.questionId === q.id
      );

      if (questionAnswer) {
        // For multiple-correct questions, we expect an array of answers
        if (q.questionType === "multiple-correct") {
          quizState.answers[q.id] = questionAnswer.answer.split(",");
        } else {
          // For single answer questions, store the answer directly
          quizState.answers[q.id] = questionAnswer.answer;
        }
      } else {
        // No answer yet for this question
        quizState.answers[q.id] =
          q.questionType === "multiple-correct" ? [] : null;
      }
    });

    updateQuizInfo();
    renderQuestions();
    startTimer();
    showQuizContent();
  } catch (error) {
    console.error("Error loading quiz:", error);
    showErrorState(error.message || "Failed to load quiz. Please try again.");
  }
}
function renderQuestions() {
  elements.questionsContainer.innerHTML = "";

  quizState.questions.forEach((question, index) => {
    console.log(question.photoUrl);
    const questionNum = index + 1;
    const questionId = question.id;
    const currentAnswer = quizState.answers[questionId];

    const questionCard = document.createElement("div");
    questionCard.className = "question-card";
    questionCard.id = `question-${questionNum}`;
    questionCard.style.display = index === 0 ? "block" : "none";

    let optionsHtml = "";

    if (question.questionType === "multiple-correct") {
      optionsHtml = question.options
        .map(
          (opt) => `
        <li class="option-item">
          <label class="option-label">
            <input type="checkbox" name="${questionId}" class="option-input" value="${
            opt.id
          }"
              ${
                currentAnswer && currentAnswer.includes(opt.id) ? "checked" : ""
              }>
            ${opt.text}
          </label>
        </li>
      `
        )
        .join("");
      if (question.photoUrl) {
        console.log(`YES`);
        optionsHtml += `
            <div class="mb-3">
              <img src="${question.photoUrl}" class="img-fluid rounded mb-2" alt="Question image">
            </div>
          `;
      }
    } else if (question.questionType === "true-false") {
      optionsHtml = `
        <li class="option-item">
          <label class="option-label">
            <input type="radio" name="${questionId}" class="option-input" value="true"
              ${currentAnswer === "true" ? "checked" : ""}>
            True
          </label>
        </li>
        <li class="option-item">
          <label class="option-label">
            <input type="radio" name="${questionId}" class="option-input" value="false"
              ${currentAnswer === "false" ? "checked" : ""}>
            False
          </label>
        </li>
      `;
      if (question.photoUrl) {
        console.log(`YES`);
        optionsHtml += `
          <div class="mb-3">
            <img src="${question.photoUrl}" class="img-fluid rounded mb-2" alt="Question image">
          </div>
        `;
      }
    } else if (question.questionType === "open-ended") {
      // Open-ended question with textarea
      optionsHtml = `
        <div class="mb-3">
          <label for="open-ended-${questionId}" class="form-label">Your answer:</label>
          <textarea class="form-control" id="open-ended-${questionId}" rows="3" 
            name="${questionId}">${currentAnswer || ""}</textarea>
        </div>
      `;

      // Add photo URL input if the question has a photo
      if (question.photoUrl) {
        console.log(`YES`);
        optionsHtml += `
          <div class="mb-3">
            <img src="${question.photoUrl}" class="img-fluid rounded mb-2" alt="Question image">
          </div>
        `;
      }
    } else {
      // Default to single correct answer
      optionsHtml = question.options
        .map(
          (opt) => `
        <li class="option-item">
          <label class="option-label">
            <input type="radio" name="${questionId}" class="option-input" value="${
            opt.id
          }"
              ${currentAnswer === opt.id ? "checked" : ""}>
            ${opt.text}
          </label>
        </li>
      `
        )
        .join("");
      if (question.photoUrl) {
        console.log(`YES`);
        optionsHtml += `
            <div class="mb-3">
              <img src="${question.photoUrl}" class="img-fluid rounded mb-2" alt="Question image">
            </div>
          `;
      }
    }

    questionCard.innerHTML = `
      <div class="question-number">Question ${questionNum}</div>
      <div class="question-text">${question.text}</div>
      <ul class="options-list" id="options-${questionNum}">
        ${optionsHtml}
      </ul>
    `;

    elements.questionsContainer.appendChild(questionCard);
  });

  updateNavigationButtons();
  updateProgress();

  // Add event listeners for all question types
  quizState.questions.forEach((question) => {
    if (question.questionType === "open-ended") {
      const textarea = document.querySelector(
        `textarea[name="${question.id}"]`
      );
      if (textarea) {
        textarea.addEventListener("input", (e) => {
          quizState.answers[question.id] = e.target.value;
          handleAnswerSelection(userData.id, question.id, question.text, [
            e.target.value,
          ]);
          updateProgress();
        });
      }
    } else {
      const inputs = document.querySelectorAll(`input[name="${question.id}"]`);
      inputs.forEach((input) => {
        input.addEventListener("change", (e) => {
          if (question.questionType === "multiple-correct") {
            const checkedOptions = Array.from(inputs)
              .filter((i) => i.checked)
              .map((i) => i.value);
            quizState.answers[question.id] = checkedOptions;
            handleAnswerSelection(
              userData.id,
              question.id,
              question.text,
              checkedOptions
            );
          } else {
            quizState.answers[question.id] = e.target.value;
            handleAnswerSelection(userData.id, question.id, question.text, [
              e.target.value,
            ]);
          }
          updateProgress();
        });
      });
    }
  });
}
// Render questions based on type
// function renderQuestions() {
//   elements.questionsContainer.innerHTML = "";

//   quizState.questions.forEach((question, index) => {
//     const questionNum = index + 1;
//     const questionId = question.id;
//     const currentAnswer = quizState.answers[questionId];

//     const questionCard = document.createElement("div");
//     questionCard.className = "question-card";
//     questionCard.id = `question-${questionNum}`;
//     questionCard.style.display = index === 0 ? "block" : "none";

//     let optionsHtml = "";

//     if (question.questionType === "multiple-correct") {
//       optionsHtml = question.options
//         .map(
//           (opt) => `
//         <li class="option-item">
//           <label class="option-label">
//             <input type="checkbox" name="${questionId}" class="option-input" value="${
//             opt.id
//           }"
//               ${
//                 currentAnswer && currentAnswer.includes(opt.id) ? "checked" : ""
//               }>
//             ${opt.text}
//           </label>
//         </li>
//       `
//         )
//         .join("");
//     } else if (question.questionType === "true-false") {
//       optionsHtml = `
//         <li class="option-item">
//           <label class="option-label">
//             <input type="radio" name="${questionId}" class="option-input" value="true"
//               ${currentAnswer === "true" ? "checked" : ""}>
//             True
//           </label>
//         </li>
//         <li class="option-item">
//           <label class="option-label">
//             <input type="radio" name="${questionId}" class="option-input" value="false"
//               ${currentAnswer === "false" ? "checked" : ""}>
//             False
//           </label>
//         </li>
//       `;
//     } else {
//       optionsHtml = question.options
//         .map(
//           (opt) => `
//         <li class="option-item">
//           <label class="option-label">
//             <input type="radio" name="${questionId}" class="option-input" value="${
//             opt.id
//           }"
//               ${currentAnswer === opt.id ? "checked" : ""}>
//             ${opt.text}
//           </label>
//         </li>
//       `
//         )
//         .join("");
//     }

//     questionCard.innerHTML = `
//       <div class="question-number">Question ${questionNum}</div>
//       <div class="question-text">${question.text}</div>
//       <ul class="options-list" id="options-${questionNum}">
//         ${optionsHtml}
//       </ul>
//     `;

//     elements.questionsContainer.appendChild(questionCard);
//   });

//   updateNavigationButtons();
//   updateProgress();
//   quizState.questions.forEach((question) => {
//     const inputs = document.querySelectorAll(`input[name="${question.id}"]`);

//     inputs.forEach((input) => {
//       input.addEventListener("change", (e) => {
//         if (question.questionType === "multiple-correct") {
//           // Handle multiple correct answers
//           const checkedOptions = Array.from(inputs)
//             .filter((i) => i.checked)
//             .map((i) => i.value);
//           quizState.answers[question.id] = checkedOptions;
//           handleAnswerSelection(
//             userData.id,
//             question.id,
//             question.text,
//             checkedOptions
//           );

//           // sendAnswerToServer(question.id, checkedOptions);
//         } else {
//           // Handle single correct and true-false answers
//           quizState.answers[question.id] = e.target.value;
//           handleAnswerSelection(userData.id, question.id, question.text, [
//             e.target.value,
//           ]);
//           // sendAnswerToServer(question.id, [e.target.value]);
//         }

//         updateProgress();
//       });
//     });
//   });
// }
function handleAnswerSelection(userId, questionId, questionText, answer) {
  socket.emit("newAnswer", {
    userId,
    questionId,
    questionText,
    answer,
    sessionId: quizState.sessionId,
  });
}
// Navigation functions
function navigateToNextQuestion() {
  if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
    showQuestion(quizState.currentQuestionIndex + 1);
  }
}

function navigateToPreviousQuestion() {
  if (quizState.currentQuestionIndex > 0) {
    showQuestion(quizState.currentQuestionIndex - 1);
  }
}

// Show specific question
function showQuestion(index) {
  const questions = document.querySelectorAll(".question-card");
  questions.forEach((q, i) => {
    q.style.display = i === index ? "block" : "none";
  });

  quizState.currentQuestionIndex = index;
  updateNavigationButtons();
}

// Update navigation button states
function updateNavigationButtons() {
  elements.prevBtn.disabled = quizState.currentQuestionIndex === 0;
  elements.nextBtn.disabled =
    quizState.currentQuestionIndex === quizState.questions.length - 1;
  // Show submit button on last question
  elements.submitQuizBtn.classList.toggle(
    "d-none",
    quizState.currentQuestionIndex !== quizState.questions.length - 1
  );
}

// Update progress calculation
function updateProgress() {
  const answeredCount = Object.values(quizState.answers).filter(
    (a) => a !== null && (Array.isArray(a) ? a.length > 0 : true)
  ).length;

  const totalQuestions = quizState.questions.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  elements.progressText.textContent = `Progress: ${answeredCount}/${totalQuestions} (${progressPercent}%)`;
  elements.progressFill.style.width = `${progressPercent}%`;
}

// Show submit confirmation
function showSubmitConfirmation() {
  const answeredCount = Object.values(quizState.answers).filter(
    (a) => a !== null && (Array.isArray(a) ? a.length > 0 : true)
  ).length;

  document.getElementById(
    "answered-count-text"
  ).textContent = `You have answered ${answeredCount} out of ${quizState.questions.length} questions.`;
}

// Start timer
function startTimer() {
  elements.timeDisplay.textContent = formatTime(quizState.timeLeft);

  quizState.timerInterval = setInterval(() => {
    quizState.timeLeft--;

    elements.timeDisplay.textContent = formatTime(quizState.timeLeft);

    // Add warning classes
    if (quizState.timeLeft <= 60) {
      elements.timeDisplay.closest(".timer").classList.add("warning");
    }

    if (quizState.timeLeft <= 30) {
      elements.timeDisplay.closest(".timer").classList.add("danger");
    }

    if (quizState.timeLeft <= 0) {
      clearInterval(quizState.timerInterval);
      submitQuiz();
    }
  }, 1000);
}

// Format time to MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

// Show loading state
function showLoadingState() {
  elements.loadingState.style.display = "flex";
  elements.quizContent.style.display = "none";
  elements.errorState.style.display = "none";
}

// Show quiz content
function showQuizContent() {
  elements.loadingState.style.display = "none";
  elements.quizContent.style.display = "block";
  elements.errorState.style.display = "none";
}

// Show error state
function showErrorState(message) {
  elements.loadingState.style.display = "none";
  elements.quizContent.style.display = "none";
  elements.errorState.style.display = "block";
  document.getElementById("error-message").textContent = message;
}

// Update quiz information
function updateQuizInfo() {
  document.getElementById("quiz-title").textContent = quizState.title;
  document.getElementById("quiz-description").textContent =
    quizState.description;
}

// Submit the quiz
async function submitQuiz() {
  clearInterval(quizState.timerInterval);

  try {
    // Close WebSocket connection
    if (quizState.websocket) {
      quizState.websocket.close();
    }
    socket.emit("submitQuiz", {
      userId: userData.id,
      sessionId: quizState.sessionId,
    });

    // Prepare answers in API format
    await submitAnswers();
  } catch (error) {
    console.error("Submission error:", error);
    alert("Error submitting quiz. Please try again.");
  }
}

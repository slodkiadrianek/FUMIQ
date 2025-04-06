// Quiz state management
import { base_url } from "./base_api.js";
let userData = JSON.parse(sessionStorage.getItem("userData"));
// document.addEventListener("visibilitychange", () => {
//   if (document.hidden) {
//     window.location.href = "https://github.com/slodkiadrianek";
//   } else {
//     console.log("Strona znów jest widoczna");
//   }
// });

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
  socket = io("http://localhost:3000");
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
  elements.saveBtn.style.display = "none";
}

// Send answer via WebSocket
function sendAnswerToServer(questionId, answer) {
  if (
    quizState.websocket &&
    quizState.websocket.readyState === WebSocket.OPEN
  ) {
    const message = {
      type: "answer",
      questionId,
      answer,
      timestamp: new Date().toISOString(),
    };
    quizState.websocket.send(JSON.stringify(message));
    console.log(`heh`);
  } else {
    console.error("WebSocket is not connected");
  }
}

// Load quiz from API
async function loadQuiz() {
  try {
    showLoadingState();

    const token = sessionStorage.getItem("authToken");

    const response = await fetch(
      `http://${base_url}/api/v1/users/${userData.id}/session/${quizState.sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    console.log(data);
    if (!data.success) {
      throw new Error("Failed to load quiz data");
    }

    // Transform API data to our quiz state format
    const quizData = data.data.quiz.quizId;
    quizState.title = quizData.title;
    quizState.description = quizData.description;
    quizState.timeLimit = quizData.timeLimit * 60; // Convert minutes to seconds

    // Transform questions from API format to our format
    quizState.questions = quizData.questions.map((q, index) => {
      const question = {
        id: q._id || `q${index + 1}`,
        text: q.questionText,
        points: 1, // Default points if not specified
        questionType: q.questionType,
        options: q.options.map((opt, i) => ({
          id: String.fromCharCode(97 + i), // a, b, c, etc.
          text: opt,
        })),
      };
      return question;
    });

    quizState.timeLeft = quizState.timeLimit;
    quizState.totalPoints = quizState.questions.length; // 1 point per question

    // Initialize answers
    quizState.answers = {};
    quizState.questions.forEach((q) => {
      quizState.answers[q.id] =
        q.questionType === "multiple-correct" ? [] : null;
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

// Render questions based on type
function renderQuestions() {
  elements.questionsContainer.innerHTML = "";

  quizState.questions.forEach((question, index) => {
    const questionNum = index + 1;
    const questionId = question.id;

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
            <input type="checkbox" name="${questionId}" class="option-input" value="${opt.id}">
            ${opt.text}
          </label>
        </li>
      `,
        )
        .join("");
    } else if (question.questionType === "true-false") {
      optionsHtml = `
        <li class="option-item">
          <label class="option-label">
            <input type="radio" name="${questionId}" class="option-input" value="true">
            True
          </label>
        </li>
        <li class="option-item">
          <label class="option-label">
            <input type="radio" name="${questionId}" class="option-input" value="false">
            False
          </label>
        </li>
      `;
    } else {
      optionsHtml = question.options
        .map(
          (opt) => `
        <li class="option-item">
          <label class="option-label">
            <input type="radio" name="${questionId}" class="option-input" value="${opt.id}">
            ${opt.text}
          </label>
        </li>
      `,
        )
        .join("");
    }

    questionCard.innerHTML = `
      <div class="question-number">Question ${questionNum}
        ${index === 0 ? '<span class="badge bg-primary ms-2">Current</span>' : ""}
      </div>
      <div class="question-text">${question.text}</div>
      <ul class="options-list" id="options-${questionNum}">
        ${optionsHtml}
      </ul>
    `;

    elements.questionsContainer.appendChild(questionCard);
  });

  // Add event listeners to options
  quizState.questions.forEach((question) => {
    const inputs = document.querySelectorAll(`input[name="${question.id}"]`);

    inputs.forEach((input) => {
      input.addEventListener("change", (e) => {
        if (question.questionType === "multiple-correct") {
          // Handle multiple correct answers
          const checkedOptions = Array.from(inputs)
            .filter((i) => i.checked)
            .map((i) => i.value);
          quizState.answers[question.id] = checkedOptions;
          console.log(question.id, checkedOptions);
          handleAnswerSelection(
            userData.id,
            question.id,
            question.text,
            checkedOptions,
          );

          // sendAnswerToServer(question.id, checkedOptions);
        } else {
          console.log(question);
          // Handle single correct and true-false answers
          quizState.answers[question.id] = e.target.value;
          handleAnswerSelection(userData.id, question.id, question.text, [
            e.target.value,
          ]);
          // sendAnswerToServer(question.id, [e.target.value]);
        }

        updateProgress();
      });
    });
  });
}
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
    quizState.currentQuestionIndex !== quizState.questions.length - 1,
  );
}

// Update progress calculation
function updateProgress() {
  const answeredCount = Object.values(quizState.answers).filter(
    (a) => a !== null && (Array.isArray(a) ? a.length > 0 : true),
  ).length;

  const totalQuestions = quizState.questions.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  elements.progressText.textContent = `Progress: ${answeredCount}/${totalQuestions} (${progressPercent}%)`;
  elements.progressFill.style.width = `${progressPercent}%`;
}

// Show submit confirmation
function showSubmitConfirmation() {
  const answeredCount = Object.values(quizState.answers).filter(
    (a) => a !== null && (Array.isArray(a) ? a.length > 0 : true),
  ).length;

  document.getElementById("answered-count-text").textContent =
    `You have answered ${answeredCount} out of ${quizState.questions.length} questions.`;
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
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
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
  document.getElementById("question-count").textContent =
    quizState.questions.length;
  document.getElementById("total-points-text").textContent =
    quizState.totalPoints;
}

// Submit the quiz
async function submitQuiz() {
  clearInterval(quizState.timerInterval);

  try {
    const token = sessionStorage.getItem("authToken");

    // Close WebSocket connection
    if (quizState.websocket) {
      quizState.websocket.close();
    }

    // Prepare answers in API format
    const submission = {
      sessionId: quizState.sessionId,
      answers: quizState.questions.map((q) => {
        const userAnswer = quizState.answers[q.id];
        return {
          questionId: q.id,
          answer: Array.isArray(userAnswer) ? userAnswer : [userAnswer],
          questionType: q.questionType,
        };
      }),
      timeSpent: quizState.timeLimit - quizState.timeLeft,
    };

    const response = await fetch(
      `http://${base_url}/api/v1/users/${userData.id}/session/${quizState.sessionId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result = await response.json();

    if (result.success) {
      window.location.href = `quiz-results.html?sessionId=${quizState.sessionId}`;
    } else {
      throw new Error(result.message || "Submission failed");
    }
  } catch (error) {
    console.error("Submission error:", error);
    alert("Error submitting quiz. Please try again.");
  }
}

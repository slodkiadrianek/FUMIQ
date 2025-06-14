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
      body: JSON.stringify({
        answers: Object.entries(quizState.answers).map(
          ([questionId, answer]) => ({
            questionId,
            answer,
          })
        ),
      }),
    }
  );

  if (response.status === 204) {
    window.location.href = `viewResult.html?sessionId=${quizState.sessionId}`;
  } else {
    const result = await response.json();
    throw new Error(result.error?.description || "Submission failed");
  }
}

let userData = JSON.parse(sessionStorage.getItem("userData"));
document.addEventListener("visibilitychange", async () => {
  if (document.hidden) {
    await submitAnswers();
    socket.emit("submitQuiz", {
      userId: userData.id,
      sessionId: quizState.sessionId,
    });
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
    if (!data.success) {
      throw new Error(data.error?.description || "Failed to load quiz");
    }

    // Transform API data to our quiz state format
    const quizData = data.data.quiz.quizId;
    const sessionData = data.data.quiz.competitor;
    quizState.title = quizData.title;
    quizState.description = quizData.description;

    // Calculate time left
    const endTime = new Date(data.data.quiz.competitor.startedAt);
    endTime.setMinutes(endTime.getMinutes() + quizData.timeLimit);
    const currentTime = new Date();
    quizState.timeLeft = Math.max(
      0,
      Math.floor((endTime - currentTime) / 1000)
    );

    // Transform questions from API format to our format
    quizState.questions = quizData.questions.map((q, index) => {
      const question = {
        id: q._id || `q${index + 1}`,
        text: q.questionText,
        points: 1,
        questionType: q.questionType,
        options: q.options || [], // Store options as array of strings (values)
        photoUrl: q.photoUrl,
      };
      return question;
    });

    quizState.answers = {};
    quizState.questions.forEach((q) => {
      const questionAnswer = sessionData.answers?.find(
        (a) => a.questionId === q.id
      );

      if (questionAnswer) {
        if (q.questionType === "multiple-correct") {
          quizState.answers[q.id] = Array.isArray(questionAnswer.answer)
            ? questionAnswer.answer
            : questionAnswer.answer.split(",");
        } else if (q.questionType === "true-false") {
          quizState.answers[q.id] =
            questionAnswer.answer === "True" ? "True" : "False";
        } else {
          quizState.answers[q.id] = questionAnswer.answer;
        }
      } else {
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
    const questionNum = index + 1;
    const questionId = question.id;
    const currentAnswer = quizState.answers[questionId];

    const questionCard = document.createElement("div");
    questionCard.className = "question-card";
    questionCard.id = `question-${questionNum}`;
    questionCard.style.display = index === 0 ? "block" : "none";

    let optionsHtml = "";
    let imageHtml = question.photoUrl
      ? `<div class="mb-3"><img src="${question.photoUrl}" class="img-fluid rounded mb-2" alt="Question image"></div>`
      : "";

    switch (question.questionType) {
      case "multiple-correct":
        optionsHtml = question.options
          .map(
            (optionValue) => `
          <li class="option-item">
            <label class="option-label">
              <input type="checkbox" name="${questionId}" class="option-input" value="${optionValue}"
                ${currentAnswer?.includes(optionValue) ? "checked" : ""}>
              ${optionValue}
            </label>
          </li>
        `
          )
          .join("");
        break;

      case "true-false":
        optionsHtml = `
          <li class="option-item">
            <label class="option-label">
              <input type="radio" name="${questionId}" class="option-input" value="True"
                ${currentAnswer === "True" ? "checked" : ""}>
              True
            </label>
          </li>
          <li class="option-item">
            <label class="option-label">
              <input type="radio" name="${questionId}" class="option-input" value="False"
                ${currentAnswer === "False" ? "checked" : ""}>
              False
            </label>
          </li>
        `;
        break;

      case "open-ended":
        optionsHtml = `
          <div class="mb-3">
            <label for="open-ended-${questionId}" class="form-label">Your answer:</label>
            <textarea class="form-control" id="open-ended-${questionId}" rows="3" 
              name="${questionId}">${currentAnswer || ""}</textarea>
          </div>
        `;
        break;

      default: // single-correct
        optionsHtml = question.options
          .map(
            (optionValue) => `
          <li class="option-item">
            <label class="option-label">
              <input type="radio" name="${questionId}" class="option-input"  value="${optionValue}"
                ${currentAnswer === optionValue ? "checked" : ""}>
              ${optionValue}
            </label>
          </li>
        `
          )
          .join("");
    }

    questionCard.innerHTML = `
      <div class="question-number">Question ${questionNum}</div>
      <div class="question-text">${question.text}</div>
      ${imageHtml}
      <ul class="options-list" id="options-${questionNum}">
        ${optionsHtml}
      </ul>
    `;

    elements.questionsContainer.appendChild(questionCard);
  });

  // Add event listeners
  quizState.questions.forEach((question) => {
    if (question.questionType === "open-ended") {
      const textarea = document.querySelector(
        `textarea[name="${question.id}"]`
      );
      if (textarea) {
        textarea.addEventListener("input", (e) => {
          quizState.answers[question.id] = e.target.value;
          updateProgress();
          // Emit the answer to websocket
          handleAnswerSelection(question.id, [e.target.value]);
        });
      }
    } else {
      const inputs = document.querySelectorAll(`input[name="${question.id}"]`);
      inputs.forEach((input) => {
        input.addEventListener("change", (e) => {
          let newAnswer;
          if (question.questionType === "multiple-correct") {
            const checkedOptions = Array.from(inputs)
              .filter((i) => i.checked)
              .map((i) => i.value); // Using the actual option value
            quizState.answers[question.id] = checkedOptions;
            newAnswer = checkedOptions;
            // Emit the answer to websocket for multiple-correct
            handleAnswerSelection(question.id, newAnswer);
          } else {
            // For single-correct, true-false, and other radio button types
            quizState.answers[question.id] = e.target.value; // Using the actual option value
            newAnswer = [];
            newAnswer.push(e.target.value);
            console.log(newAnswer);
            // Emit the answer to websocket for single-correct and true-false
            handleAnswerSelection(question.id, newAnswer);
          }
          updateProgress();
        });
      });
    }
  });

  updateNavigationButtons();
  updateProgress();
}

function handleAnswerSelection(questionId, answer) {
  const question = quizState.questions.find((q) => q.id === questionId);
  if (!question) return;

  // Send the actual answer value (not label like a, b, c, d)
  socket.emit("newAnswer", {
    userId: userData.id,
    questionId,
    questionText: question.text,
    answer: answer,
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

function showQuestion(index) {
  const questions = document.querySelectorAll(".question-card");
  questions.forEach((q, i) => {
    q.style.display = i === index ? "block" : "none";
  });

  quizState.currentQuestionIndex = index;
  updateNavigationButtons();
}

function updateNavigationButtons() {
  elements.prevBtn.disabled = quizState.currentQuestionIndex === 0;
  elements.nextBtn.disabled =
    quizState.currentQuestionIndex === quizState.questions.length - 1;
  elements.submitQuizBtn.classList.toggle(
    "d-none",
    quizState.currentQuestionIndex !== quizState.questions.length - 1
  );
}

function updateProgress() {
  const answeredCount = Object.values(quizState.answers).filter(
    (a) => a !== null && (Array.isArray(a) ? a.length > 0 : true)
  ).length;

  const totalQuestions = quizState.questions.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  elements.progressText.textContent = `Progress: ${answeredCount}/${totalQuestions} (${progressPercent}%)`;
  elements.progressFill.style.width = `${progressPercent}%`;
}

function showSubmitConfirmation() {
  const answeredCount = Object.values(quizState.answers).filter(
    (a) => a !== null && (Array.isArray(a) ? a.length > 0 : true)
  ).length;

  document.getElementById(
    "answered-count-text"
  ).textContent = `You have answered ${answeredCount} out of ${quizState.questions.length} questions.`;
}

function startTimer() {
  elements.timeDisplay.textContent = formatTime(quizState.timeLeft);

  quizState.timerInterval = setInterval(() => {
    quizState.timeLeft--;

    elements.timeDisplay.textContent = formatTime(quizState.timeLeft);

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

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function showLoadingState() {
  elements.loadingState.style.display = "flex";
  elements.quizContent.style.display = "none";
  elements.errorState.style.display = "none";
}

function showQuizContent() {
  elements.loadingState.style.display = "none";
  elements.quizContent.style.display = "block";
  elements.errorState.style.display = "none";
}

function showErrorState(message) {
  elements.loadingState.style.display = "none";
  elements.quizContent.style.display = "none";
  elements.errorState.style.display = "block";
  document.getElementById("error-message").textContent = message;
}

function updateQuizInfo() {
  document.getElementById("quiz-title").textContent = quizState.title;
  document.getElementById("quiz-description").textContent =
    quizState.description;
}

async function submitQuiz() {
  clearInterval(quizState.timerInterval);

  try {
    // Prepare answers - they're already in the correct format (actual values, not labels)
    const answersToSubmit = Object.entries(quizState.answers).map(
      ([questionId, answer]) => ({
        questionId,
        answer: answer, // This is now the actual option value/text
      })
    );

    if (socket) {
      socket.emit("submitQuiz", {
        userId: userData.id,
        sessionId: quizState.sessionId,
        answers: answersToSubmit,
      });
    }

    await submitAnswers();
  } catch (error) {
    console.error("Submission error:", error);
    alert("Error submitting quiz. Please try again.");
  }
}

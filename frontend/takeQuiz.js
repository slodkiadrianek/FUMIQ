// Quiz state management
const quizState = {
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  timeLimit: 0,
  timeLeft: 0,
  timerInterval: null,
  totalPoints: 0,
  quizId: null,
};

// DOM elements
const elements = {
  loadingState: document.getElementById("loading-state"),
  errorState: document.getElementById("error-state"),
  quizContent: document.getElementById("quiz-content"),
  quizTitle: document.getElementById("quiz-title"),
  quizDescription: document.getElementById("quiz-description"),
  questionsContainer: document.getElementById("questions-container"),
  questionNav: document.getElementById("question-nav"),
  progressText: document.getElementById("progress-text"),
  progressFill: document.getElementById("progress-fill"),
  scoreText: document.getElementById("score-text"),
  totalPointsText: document.getElementById("total-points-text"),
  questionCount: document.getElementById("question-count"),
  timeDisplay: document.getElementById("time-display"),
  quizTimer: document.getElementById("quiz-timer"),
  prevBtn: document.getElementById("prev-btn"),
  nextBtn: document.getElementById("next-btn"),
  saveBtn: document.getElementById("save-btn"),
  submitQuizBtn: document.getElementById("submit-quiz-btn"),
  answeredCountText: document.getElementById("answered-count-text"),
  confirmSubmit: document.getElementById("confirm-submit"),
  retryBtn: document.getElementById("retry-btn"),
  errorMessage: document.getElementById("error-message"),
};

// Initialize the quiz
document.addEventListener("DOMContentLoaded", function () {
  // Get quiz ID from URL or other source
  const urlParams = new URLSearchParams(window.location.search);
  quizState.quizId = urlParams.get("id") || "default-quiz-id";

  // Load the quiz
  loadQuiz();

  // Set up event listeners
  setupEventListeners();
});

// Load quiz from API
async function loadQuiz() {
  try {
    showLoadingState();

    // Simulate API call (replace with actual fetch)
    // const response = await fetch(`/api/quizzes/${quizState.quizId}`);
    // const data = await response.json();

    // Mock API response for demonstration
    const data = await mockFetchQuiz();

    if (data.error) {
      throw new Error(data.error);
    }

    // Initialize quiz state
    quizState.questions = data.questions;
    quizState.timeLimit = data.timeLimit || 15 * 60; // Default to 15 minutes
    quizState.timeLeft = quizState.timeLimit;
    quizState.totalPoints = data.totalPoints || quizState.questions.length * 5; // Default to 5 points per question

    // Initialize answers object
    quizState.answers = {};
    quizState.questions.forEach((q, i) => {
      quizState.answers[`q${i + 1}`] = null;
    });

    // Update UI
    updateQuizInfo();
    renderQuestions();
    renderQuestionNav();
    startTimer();

    showQuizContent();
  } catch (error) {
    console.error("Error loading quiz:", error);
    showErrorState(error.message || "Failed to load quiz. Please try again.");
  }
}

// Mock API function for demonstration
async function mockFetchQuiz() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "math-quiz-1",
        title: "Mathematics Quiz",
        description: "Test your knowledge of basic mathematics concepts",
        timeLimit: 15 * 60, // 15 minutes
        totalPoints: 25,
        questions: [
          {
            id: "q1",
            text: "What is the value of π (pi) rounded to two decimal places?",
            points: 5,
            options: [
              { id: "a", text: "3.14", correct: true },
              { id: "b", text: "3.16", correct: false },
              { id: "c", text: "3.18", correct: false },
              { id: "d", text: "3.12", correct: false },
            ],
          },
          {
            id: "q2",
            text: "What is the square root of 64?",
            points: 5,
            options: [
              { id: "a", text: "6", correct: false },
              { id: "b", text: "7", correct: false },
              { id: "c", text: "8", correct: true },
              { id: "d", text: "9", correct: false },
            ],
          },
          {
            id: "q3",
            text: "Solve for x: 2x + 5 = 15",
            points: 5,
            options: [
              { id: "a", text: "5", correct: true },
              { id: "b", text: "6", correct: false },
              { id: "c", text: "7", correct: false },
              { id: "d", text: "8", correct: false },
            ],
          },
          {
            id: "q4",
            text: "What is the area of a rectangle with length 8 and width 5?",
            points: 5,
            options: [
              { id: "a", text: "13", correct: false },
              { id: "b", text: "26", correct: false },
              { id: "c", text: "40", correct: true },
              { id: "d", text: "45", correct: false },
            ],
          },
          {
            id: "q5",
            text: "Which of these is a prime number?",
            points: 5,
            options: [
              { id: "a", text: "15", correct: false },
              { id: "b", text: "21", correct: false },
              { id: "c", text: "29", correct: true },
              { id: "d", text: "33", correct: false },
            ],
          },
        ],
      });
    }, 1500); // Simulate network delay
  });
}

// Set up event listeners
function setupEventListeners() {
  // Navigation buttons
  elements.prevBtn.addEventListener("click", goToPreviousQuestion);
  elements.nextBtn.addEventListener("click", goToNextQuestion);

  // Save button
  elements.saveBtn.addEventListener("click", saveProgress);

  // Submit button
  elements.confirmSubmit.addEventListener("click", submitQuiz);

  // Retry button
  elements.retryBtn.addEventListener("click", loadQuiz);
}

// Show loading state
function showLoadingState() {
  elements.loadingState.style.display = "flex";
  elements.errorState.style.display = "none";
  elements.quizContent.style.display = "none";
}

// Show error state
function showErrorState(message) {
  elements.loadingState.style.display = "none";
  elements.errorState.style.display = "block";
  elements.quizContent.style.display = "none";
  elements.errorMessage.textContent = message;
}

// Show quiz content
function showQuizContent() {
  elements.loadingState.style.display = "none";
  elements.errorState.style.display = "none";
  elements.quizContent.style.display = "block";
}

// Update quiz info in header
function updateQuizInfo() {
  elements.quizTitle.textContent = quizState.title || "Quiz";
  elements.quizDescription.textContent =
    quizState.description || "Test your knowledge";
  elements.questionCount.textContent = quizState.questions.length;
  elements.totalPointsText.textContent = quizState.totalPoints;
  updateProgress();
}

// Render all questions (initially hidden)
function renderQuestions() {
  elements.questionsContainer.innerHTML = "";

  quizState.questions.forEach((question, index) => {
    const questionNum = index + 1;
    const questionId = `q${questionNum}`;

    const questionCard = document.createElement("div");
    questionCard.className = "question-card";
    questionCard.id = `question-${questionNum}`;
    questionCard.style.display = index === 0 ? "block" : "none";

    questionCard.innerHTML = `
            <div class="question-number">Question ${questionNum} ${index === 0 ? '<span class="badge bg-primary ms-2">Current</span>' : ""}</div>
            <div class="question-text">${question.text}</div>
            <ul class="options-list" id="options-${questionNum}">
              ${question.options
                .map(
                  (option) => `
                <li class="option-item">
                  <label class="option-label ${quizState.answers[questionId] === option.id ? "selected" : ""}">
                    <input type="radio" name="${questionId}" class="option-input" value="${option.id}"
                      ${quizState.answers[questionId] === option.id ? "checked" : ""}>
                    ${option.text}
                  </label>
                </li>
              `,
                )
                .join("")}
            </ul>
          `;

    elements.questionsContainer.appendChild(questionCard);
  });

  // Add event listeners to options
  quizState.questions.forEach((question, index) => {
    const questionNum = index + 1;
    const questionId = `q${questionNum}`;

    document
      .querySelectorAll(`input[name="${questionId}"]`)
      .forEach((input) => {
        input.addEventListener("change", (e) => {
          quizState.answers[questionId] = e.target.value;
          document
            .querySelector(`#question-nav-btn-${questionNum}`)
            .classList.add("answered");
          updateProgress();
        });
      });
  });
}

// Render question navigation
function renderQuestionNav() {
  elements.questionNav.innerHTML = "";

  quizState.questions.forEach((_, index) => {
    const questionNum = index + 1;
    const btn = document.createElement("div");
    btn.className = `question-nav-btn ${index === 0 ? "current" : ""} ${quizState.answers[`q${questionNum}`] ? "answered" : ""}`;
    btn.textContent = questionNum;
    btn.id = `question-nav-btn-${questionNum}`;
    btn.dataset.question = questionNum;

    btn.addEventListener("click", () => {
      goToQuestion(index);
    });

    elements.questionNav.appendChild(btn);
  });
}

// Update progress bar and text
function updateProgress() {
  const answeredCount = Object.values(quizState.answers).filter(
    (a) => a !== null,
  ).length;
  const totalQuestions = quizState.questions.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  elements.progressText.textContent = `Progress: ${answeredCount}/${totalQuestions} (${progressPercent}%)`;
  elements.progressFill.style.width = `${progressPercent}%`;
  elements.answeredCountText.textContent = `You have answered ${answeredCount} out of ${totalQuestions} questions.`;

  // Calculate score (this would be more complex in a real app)
  const score = Object.entries(quizState.answers).reduce(
    (total, [key, value]) => {
      if (!value) return total;
      const questionNum = parseInt(key.substring(1)) - 1;
      const question = quizState.questions[questionNum];
      const selectedOption = question.options.find((opt) => opt.id === value);
      return total + (selectedOption?.correct ? question.points : 0);
    },
    0,
  );

  elements.scoreText.textContent = score;
}

// Start the quiz timer
function startTimer() {
  if (quizState.timerInterval) {
    clearInterval(quizState.timerInterval);
  }

  updateTimerDisplay();

  quizState.timerInterval = setInterval(() => {
    quizState.timeLeft--;

    if (quizState.timeLeft <= 0) {
      clearInterval(quizState.timerInterval);
      elements.quizTimer.textContent = "00:00";
      submitQuiz();
      return;
    }

    updateTimerDisplay();
  }, 1000);
}

// Update timer display
function updateTimerDisplay() {
  const minutes = Math.floor(quizState.timeLeft / 60);
  const seconds = quizState.timeLeft % 60;

  elements.timeDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Change timer color when time is running low
  elements.quizTimer.classList.remove("warning", "danger");

  if (quizState.timeLeft <= 2 * 60) {
    // 2 minutes left
    elements.quizTimer.classList.add("warning");
  }
  if (quizState.timeLeft <= 30) {
    // 30 seconds left
    elements.quizTimer.classList.remove("warning");
    elements.quizTimer.classList.add("danger");
  }
}

// Navigate to a specific question
function goToQuestion(index) {
  if (index < 0 || index >= quizState.questions.length) return;

  // Hide all questions
  document.querySelectorAll(".question-card").forEach((card) => {
    card.style.display = "none";
  });

  // Show selected question
  document.getElementById(`question-${index + 1}`).style.display = "block";

  // Update current question index
  quizState.currentQuestionIndex = index;

  // Update navigation buttons
  elements.prevBtn.disabled = index === 0;

  if (index === quizState.questions.length - 1) {
    elements.nextBtn.classList.add("d-none");
    elements.submitQuizBtn.classList.remove("d-none");
  } else {
    elements.nextBtn.classList.remove("d-none");
    elements.submitQuizBtn.classList.add("d-none");
  }

  // Update question nav buttons
  document.querySelectorAll(".question-nav-btn").forEach((btn) => {
    btn.classList.remove("current");
  });
  document
    .querySelector(`#question-nav-btn-${index + 1}`)
    .classList.add("current");

  // Update question number badge
  document
    .querySelectorAll(".question-number .badge")
    .forEach((el) => el.remove());
  document.querySelector(`#question-${index + 1} .question-number`).innerHTML +=
    ` <span class="badge bg-primary ms-2">Current</span>`;
}

// Go to previous question
function goToPreviousQuestion() {
  goToQuestion(quizState.currentQuestionIndex - 1);
}

// Go to next question
function goToNextQuestion() {
  goToQuestion(quizState.currentQuestionIndex + 1);
}

// Save progress (would be sent to API in a real app)
// Save progress (would be sent to API in a real app)
function saveProgress() {
  // In a real app, you would send this to your backend
  console.log("Saving progress:", quizState.answers);

  // Show feedback to user
  const saveBtn = elements.saveBtn;
  const originalHtml = saveBtn.innerHTML;

  saveBtn.innerHTML = '<i class="bi bi-check"></i> Saved';
  saveBtn.classList.remove("btn-secondary");
  saveBtn.classList.add("btn-success");

  setTimeout(() => {
    saveBtn.innerHTML = originalHtml;
    saveBtn.classList.add("btn-secondary");
    saveBtn.classList.remove("btn-success");
  }, 2000);
}

// Submit the quiz
function submitQuiz() {
  clearInterval(quizState.timerInterval);

  // In a real app, you would send the answers to your backend
  console.log("Submitting quiz:", quizState.answers);

  // Calculate score (simplified for demo)
  const score = Object.entries(quizState.answers).reduce(
    (total, [key, value]) => {
      if (!value) return total;
      const questionNum = parseInt(key.substring(1)) - 1;
      const question = quizState.questions[questionNum];
      const selectedOption = question.options.find((opt) => opt.id === value);
      return total + (selectedOption?.correct ? question.points : 0);
    },
    0,
  );

  // Show submission feedback (in a real app, you'd redirect to results)
  alert(`Quiz submitted! Your score: ${score}/${quizState.totalPoints}`);

  // Redirect to results page
  // window.location.href = `quiz-results.html?id=${quizState.quizId}&score=${score}`;
}

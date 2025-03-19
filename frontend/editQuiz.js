import { base_url } from "./base_api";
const testForm = document.getElementById("edit-test-form");
const questionsContainer = document.getElementById("questions-container");

// Function to fetch test details
async function fetchTestDetails() {
  const testId = new URLSearchParams(window.location.search).get("id");
  if (!testId) {
    alert("Test ID not found.");
    return;
  }

  const token = sessionStorage.getItem("authToken");
  const response = await fetch(`http://${base_url}/api/v1/quiz/${testId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();

  if (data.success) {
    const test = data.data;
    document.getElementById("test-title").value = test.title;
    document.getElementById("test-description").value = test.description;
    document.getElementById("time-limit").value = test.timeLimit;

    // Render questions
    test.questions.forEach((question, index) => {
      addQuestionCard(question, index + 1);
    });
  } else {
    alert("Failed to fetch test details.");
  }
}

// Function to add a question card
function addQuestionCard(question, questionNumber) {
  const questionCard = document.createElement("div");
  questionCard.className = "question-card";
  questionCard.innerHTML = `
    <h4>Question ${questionNumber}</h4>
    <div class="mb-3">
      <label for="question-text-${questionNumber}" class="form-label">Question Text</label>
      <input
        type="text"
        class="form-control question-text"
        id="question-text-${questionNumber}"
        placeholder="Enter question text"
        value="${question.questionText}"
        required
      />
    </div>
    <div class="mb-3">
      <label for="question-type-${questionNumber}" class="form-label">Question Type</label>
      <select class="form-control question-type" id="question-type-${questionNumber}" required>
        <option value="single-correct" ${question.questionType === "single-correct" ? "selected" : ""}>Single Correct Answer</option>
        <option value="multiple-correct" ${question.questionType === "multiple-correct" ? "selected" : ""}>Multiple Correct Answers</option>
        <option value="true-false" ${question.questionType === "true-false" ? "selected" : ""}>True/False</option>
      </select>
    </div>
    <div class="mb-3 options-container" id="options-container-${questionNumber}">
      <label class="form-label">Options (A, B, C, D)</label>
      ${question.options
        .map(
          (option, i) => `
          <div class="mb-2">
            <input
              type="text"
              class="form-control option-input"
              placeholder="Option ${String.fromCharCode(65 + i)}"
              value="${option}"
              required
            />
          </div>
        `
        )
        .join("")}
    </div>
    <div class="mb-3 correct-answer-container" id="correct-answer-container-${questionNumber}">
      <label class="form-label">Correct Answer</label>
      ${renderCorrectAnswerInput(question, questionNumber)}
    </div>
    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">
      <i class="bi bi-trash"></i> Remove Question
    </button>
  `;
  questionsContainer.appendChild(questionCard);
}

// Function to render correct answer input based on question type
function renderCorrectAnswerInput(question, questionNumber) {
  if (question.questionType === "single-correct") {
    return `
      <select class="form-control">
        ${["A", "B", "C", "D"]
          .map(
            (option) => `
            <option value="${option}" ${question.correctAnswer === option ? "selected" : ""}>${option}</option>
          `
          )
          .join("")}
      </select>
    `;
  } else if (question.questionType === "multiple-correct") {
    return `
      <div class="form-check">
        ${["A", "B", "C", "D"]
          .map(
            (option) => `
            <div>
              <input
                type="checkbox"
                class="form-check-input"
                value="${option}"
                ${question.correctAnswer.includes(option) ? "checked" : ""}
              />
              <label class="form-check-label">${option}</label>
            </div>
          `
          )
          .join("")}
      </div>
    `;
  } else if (question.questionType === "true-false") {
    return `
      <select class="form-control">
        <option value="True" ${question.correctAnswer === "True" ? "selected" : ""}>True</option>
        <option value="False" ${question.correctAnswer === "False" ? "selected" : ""}>False</option>
      </select>
    `;
  }
}

fetchTestDetails();

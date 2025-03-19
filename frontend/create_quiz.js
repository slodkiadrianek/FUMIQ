import { base_url } from "./base_api.js";

const login_form = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");
const success_message = document.getElementById("success-message");
let questionCount = 0;

// Function to add a new question
document.getElementById("add-question").addEventListener("click", function () {
  questionCount++;
  const questionsContainer = document.getElementById("questions-container");

  const questionCard = document.createElement("div");
  questionCard.className = "question-card animate__animated animate__fadeInUp";
  questionCard.innerHTML = `
      <h4>Question ${questionCount}</h4>
      <div class="mb-3">
        <label for="question-text-${questionCount}" class="form-label">Question Text</label>
        <input
          type="text"
          class="form-control question-text"
          id="question-text-${questionCount}"
          placeholder="Enter question text"
          required
        />
      </div>
      <div class="mb-3">
        <label for="question-type-${questionCount}" class="form-label">Question Type</label>
        <select class="form-control question-type" id="question-type-${questionCount}" required>
          <option value="single-correct">Single Correct Answer (A, B, C, D)</option>
          <option value="multiple-correct">Multiple Correct Answers (A, B, C, D)</option>
          <option value="true-false">True/False</option>
        </select>
      </div>
      <div class="mb-3 options-container" id="options-container-${questionCount}">
        <label class="form-label">Options (A, B, C, D)</label>
        <div class="mb-2">
          <input
            type="text"
            class="form-control option-input"
            placeholder="Option A"
            required
          />
        </div>
        <div class="mb-2">
          <input
            type="text"
            class="form-control option-input"
            placeholder="Option B"
            required
          />
        </div>
        <div class="mb-2">
          <input
            type="text"
            class="form-control option-input"
            placeholder="Option C"
            required
          />
        </div>
        <div class="mb-2">
          <input
            type="text"
            class="form-control option-input"
            placeholder="Option D"
            required
          />
        </div>
      </div>
      <div class="mb-3 correct-answer-container" id="correct-answer-container-${questionCount}">
        <label class="form-label">Correct Answer</label>
        <div class="correct-answer-single" id="correct-answer-single-${questionCount}">
          <select class="form-control">
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
        <div class="correct-answer-multiple" id="correct-answer-multiple-${questionCount}" style="display: none;">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="A" id="correct-answer-A-${questionCount}">
            <label class="form-check-label" for="correct-answer-A-${questionCount}">A</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="B" id="correct-answer-B-${questionCount}">
            <label class="form-check-label" for="correct-answer-B-${questionCount}">B</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="C" id="correct-answer-C-${questionCount}">
            <label class="form-check-label" for="correct-answer-C-${questionCount}">C</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="D" id="correct-answer-D-${questionCount}">
            <label class="form-check-label" for="correct-answer-D-${questionCount}">D</label>
          </div>
        </div>
        <div class="correct-answer-true-false" id="correct-answer-true-false-${questionCount}" style="display: none;">
          <select class="form-control">
            <option value="True">True</option>
            <option value="False">False</option>
          </select>
        </div>
      </div>
      <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">
        <i class="bi bi-trash"></i> Remove Question
      </button>
    `;

  questionsContainer.appendChild(questionCard);

  // Show/hide options and correct answer based on question type
  const questionType = questionCard.querySelector(".question-type");
  const optionsContainer = questionCard.querySelector(".options-container");
  const correctAnswerSingle = questionCard.querySelector(
    ".correct-answer-single"
  );
  const correctAnswerMultiple = questionCard.querySelector(
    ".correct-answer-multiple"
  );
  const correctAnswerTrueFalse = questionCard.querySelector(
    ".correct-answer-true-false"
  );

  // Function to toggle required attribute
  const toggleRequired = (element, isRequired) => {
    if (isRequired) {
      element.setAttribute("required", true);
    } else {
      element.removeAttribute("required");
    }
  };

  // Initialize based on default question type
  if (questionType.value === "single-correct") {
    optionsContainer.style.display = "block";
    correctAnswerSingle.style.display = "block";
    correctAnswerMultiple.style.display = "none";
    correctAnswerTrueFalse.style.display = "none";
    toggleRequired(correctAnswerSingle.querySelector("select"), true);
  } else if (questionType.value === "multiple-correct") {
    optionsContainer.style.display = "block";
    correctAnswerSingle.style.display = "none";
    correctAnswerMultiple.style.display = "block";
    correctAnswerTrueFalse.style.display = "none";
    toggleRequired(
      correctAnswerMultiple.querySelectorAll("input[type='checkbox']")[0],
      true
    );
  } else if (questionType.value === "true-false") {
    optionsContainer.style.display = "none";
    correctAnswerSingle.style.display = "none";
    correctAnswerMultiple.style.display = "none";
    correctAnswerTrueFalse.style.display = "block";
    toggleRequired(correctAnswerTrueFalse.querySelector("select"), true);
  }

  // Add event listener for question type change
  questionType.addEventListener("change", function () {
    if (this.value === "single-correct") {
      optionsContainer.style.display = "block";
      correctAnswerSingle.style.display = "block";
      correctAnswerMultiple.style.display = "none";
      correctAnswerTrueFalse.style.display = "none";
      toggleRequired(correctAnswerSingle.querySelector("select"), true);
      toggleRequired(
        correctAnswerMultiple.querySelectorAll("input[type='checkbox']")[0],
        false
      );
      toggleRequired(correctAnswerTrueFalse.querySelector("select"), false);
    } else if (this.value === "multiple-correct") {
      optionsContainer.style.display = "block";
      correctAnswerSingle.style.display = "none";
      correctAnswerMultiple.style.display = "block";
      correctAnswerTrueFalse.style.display = "none";
      toggleRequired(correctAnswerSingle.querySelector("select"), false);
      toggleRequired(
        correctAnswerMultiple.querySelectorAll("input[type='checkbox']")[0],
        true
      );
      toggleRequired(correctAnswerTrueFalse.querySelector("select"), false);
    } else if (this.value === "true-false") {
      optionsContainer.style.display = "none";
      correctAnswerSingle.style.display = "none";
      correctAnswerMultiple.style.display = "none";
      correctAnswerTrueFalse.style.display = "block";
      toggleRequired(correctAnswerSingle.querySelector("select"), false);
      toggleRequired(
        correctAnswerMultiple.querySelectorAll("input[type='checkbox']")[0],
        false
      );
      toggleRequired(correctAnswerTrueFalse.querySelector("select"), true);
    }
  });
});

document
  .getElementById("create-test-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const questionsContainer = document.getElementById("questions-container");
    const testTitle = document.getElementById("test-title").value;
    const testDescription = document.getElementById("test-description").value;
    const timeLimit = document.getElementById("time-limit").value;

    const questions = [];
    const questionCards = document.querySelectorAll(".question-card");

    if (questionCards.length === 0) {
      alert("Please add at least one question.");
      return;
    }

    let isValid = true;

    questionCards.forEach((card, index) => {
      const questionText = card.querySelector(".question-text").value;
      const questionType = card.querySelector(".question-type").value;
      let correctAnswer;

      if (questionType === "single-correct") {
        correctAnswer = card.querySelector(
          ".correct-answer-single select"
        ).value;
      } else if (questionType === "multiple-correct") {
        const checkboxes = card.querySelectorAll(
          ".correct-answer-multiple input:checked"
        );
        correctAnswer = Array.from(checkboxes).map(
          (checkbox) => checkbox.value
        );
        if (correctAnswer.length === 0) {
          isValid = false;
          alert(
            `Question ${index + 1}: Please select at least one correct answer.`
          );
        }
      } else if (questionType === "true-false") {
        correctAnswer = card.querySelector(
          ".correct-answer-true-false select"
        ).value;
      }

      const options =
        questionType !== "true-false"
          ? Array.from(card.querySelectorAll(".option-input")).map(
              (input) => input.value
            )
          : [];

      questions.push({
        questionText,
        questionType,
        correctAnswer,
        options,
      });
    });

    if (!isValid) {
      return;
    }

    const testData = {
      title: testTitle,
      description: testDescription,
      timeLimit: +timeLimit,
      questions,
    };

    console.log("Test Data:", testData);
    const token = sessionStorage.getItem("authToken");

    const response = await fetch(`http://${base_url}/api/v1/quizez/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(testData),
    });
    const responseData = await response.json();
    if (!responseData.success) {
      success_message.classList.add("d-none");
      errorMessage.innerHTML = responseData.error.description;
      errorMessage.classList.remove("d-none");
    } else {
      errorMessage.classList.add("d-none");
      document.getElementById("create-test-form").reset();
      success_message.classList.remove("d-none");
      success_message.innerHTML = "Quiz has been created successfully";
      questionsContainer.innerHTML = "";
    }
    console.log(responseData);
  });

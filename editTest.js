import { base_url } from "./base_api.js";

const errorMessage = document.getElementById("error-message");
const success_message = document.getElementById("success-message");
let questionCount = 0;

// Helper function to toggle required attribute
const toggleRequired = (element, isRequired) => {
  if (isRequired) {
    element.setAttribute("required", true);
  } else {
    element.removeAttribute("required");
  }
};

// Helper function to handle question type changes
const handleQuestionTypeChange = (questionCard, questionType) => {
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
  const correctAnswerOpenEnded = questionCard.querySelector(
    ".correct-answer-open-ended"
  );
  const correctAnswerLabel = questionCard.querySelector(
    ".correct-answer-label"
  );
  const optionInputs = questionCard.querySelectorAll(".option-input");

  // Hide all first
  optionsContainer.style.display = "none";
  correctAnswerSingle.style.display = "none";
  correctAnswerMultiple.style.display = "none";
  correctAnswerTrueFalse.style.display = "none";
  correctAnswerOpenEnded.style.display = "none";
  correctAnswerLabel.style.display = "block";

  // Reset required attributes
  toggleRequired(correctAnswerSingle.querySelector("select"), false);
  const checkboxes = correctAnswerMultiple.querySelectorAll(
    "input[type='checkbox']"
  );
  if (checkboxes.length > 0) {
    toggleRequired(checkboxes[0], false);
  }
  toggleRequired(correctAnswerTrueFalse.querySelector("select"), false);
  optionInputs.forEach((input) => toggleRequired(input, false));

  // Show appropriate elements based on question type
  if (questionType === "single-correct") {
    optionsContainer.style.display = "block";
    correctAnswerSingle.style.display = "block";
    toggleRequired(correctAnswerSingle.querySelector("select"), true);
    optionInputs.forEach((input) => toggleRequired(input, true));
  } else if (questionType === "multiple-correct") {
    optionsContainer.style.display = "block";
    correctAnswerMultiple.style.display = "block";
    if (checkboxes.length > 0) {
      toggleRequired(checkboxes[0], true);
    }
    optionInputs.forEach((input) => toggleRequired(input, true));
  } else if (questionType === "true-false") {
    optionsContainer.style.display = "block";
    correctAnswerTrueFalse.style.display = "block";
    toggleRequired(correctAnswerTrueFalse.querySelector("select"), true);

    // Set True/False values and lock them
    optionInputs[0].value = "True";
    optionInputs[0].readOnly = true;
    optionInputs[1].value = "False";
    optionInputs[1].readOnly = true;

    // Hide extra options
    for (let i = 2; i < optionInputs.length; i++) {
      optionInputs[i].parentElement.style.display = "none";
    }
  } else if (questionType === "open-ended") {
    correctAnswerOpenEnded.style.display = "block";
    correctAnswerLabel.style.display = "none";
    optionsContainer.style.display = "none";
  }
};

// Function to create a new question card
const createQuestionCard = (questionNumber, questionData = null) => {
  const questionCard = document.createElement("div");
  questionCard.className = "question-card animate__animated animate__fadeInUp";

  // Set default values or use provided data
  const questionText = questionData ? questionData.questionText : "";
  const questionType = questionData
    ? questionData.questionType
    : "single-correct";
  const options = questionData ? questionData.options || [] : ["", "", "", ""];
  let correctAnswer = questionData ? questionData.correctAnswer : "";

  // For multiple-correct, ensure correctAnswer is an array
  if (questionType === "multiple-correct" && !Array.isArray(correctAnswer)) {
    correctAnswer = correctAnswer ? [correctAnswer] : [];
  }

  questionCard.innerHTML = `
    <h4>Question ${questionNumber}</h4>
    <div class="mb-3">
      <label for="question-text-${questionCount}" class="form-label">Question Text</label>
      <input
        type="text"
        class="form-control question-text"
        id="question-text-${questionCount}"
        value="${questionText}"
        placeholder="Enter question text"
        required
      />
    </div>
    
    <!-- Image Upload Section -->
    <div class="mb-3">
      <label for="question-image-${questionCount}" class="form-label">Question Image (Optional)</label>
      <input
        type="file"
        class="form-control question-image"
        id="question-image-${questionCount}"
        accept="image/*"
      />
      <small class="text-muted">You can upload an image to accompany the question</small>
      ${
        questionData?.photoUrl
          ? `
        <div class="mt-2">
          <div class="current-image-container">
            <img src="${
              questionData.photoUrl
            }" alt="Question Image" class="img-thumbnail" style="max-height: 150px;"/>
            <div class="mt-1">
              <small class="text-muted">Current image: ${questionData.photoUrl
                .split("/")
                .pop()}</small>
            </div>
          </div>
        </div>
        <input type="hidden" class="current-photo-url" value="${
          questionData.photoUrl
        }">
      `
          : ""
      }
    </div>
    
    <div class="mb-3">
      <label for="question-type-${questionCount}" class="form-label">Question Type</label>
      <select class="form-control question-type" id="question-type-${questionCount}" required>
        <option value="single-correct" ${
          questionType === "single-correct" ? "selected" : ""
        }>Single Correct Answer</option>
        <option value="multiple-correct" ${
          questionType === "multiple-correct" ? "selected" : ""
        }>Multiple Correct Answers</option>
        <option value="true-false" ${
          questionType === "true-false" ? "selected" : ""
        }>True/False</option>
        <option value="open-ended" ${
          questionType === "open-ended" ? "selected" : ""
        }>Open Ended</option>
      </select>
    </div>
    
    <div class="mb-3 options-container" id="options-container-${questionCount}">
      <label class="form-label">Options</label>
      <div class="mb-2">
        <input
          type="text"
          class="form-control option-input"
          placeholder="Option A"
          value="${options[0] || ""}"
          required
        />
      </div>
      <div class="mb-2">
        <input
          type="text"
          class="form-control option-input"
          placeholder="Option B"
          value="${options[1] || ""}"
          required
        />
      </div>
      ${
        questionType !== "true-false"
          ? `
        <div class="mb-2">
          <input
            type="text"
            class="form-control option-input"
            placeholder="Option C"
            value="${options[2] || ""}"
          />
        </div>
        <div class="mb-2">
          <input
            type="text"
            class="form-control option-input"
            placeholder="Option D"
            value="${options[3] || ""}"
          />
        </div>
      `
          : ""
      }
    </div>
    
    <div class="mb-3 correct-answer-container" id="correct-answer-container-${questionCount}">
      <label class="form-label correct-answer-label">Correct Answer</label>
      <div class="correct-answer-single" id="correct-answer-single-${questionCount}">
        <select class="form-control">
          <option value="A" ${
            correctAnswer === options[0] ? "selected" : ""
          }>A</option>
          <option value="B" ${
            correctAnswer === options[1] ? "selected" : ""
          }>B</option>
          ${
            options[2]
              ? `<option value="C" ${
                  correctAnswer === options[2] ? "selected" : ""
                }>C</option>`
              : ""
          }
          ${
            options[3]
              ? `<option value="D" ${
                  correctAnswer === options[3] ? "selected" : ""
                }>D</option>`
              : ""
          }
        </select>
      </div>
      <div class="correct-answer-multiple" id="correct-answer-multiple-${questionCount}" style="display: none;">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="A" id="correct-answer-A-${questionCount}" ${
    Array.isArray(correctAnswer) && correctAnswer.includes(options[0])
      ? "checked"
      : ""
  }>
          <label class="form-check-label" for="correct-answer-A-${questionCount}">A</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="B" id="correct-answer-B-${questionCount}" ${
    Array.isArray(correctAnswer) && correctAnswer.includes(options[1])
      ? "checked"
      : ""
  }>
          <label class="form-check-label" for="correct-answer-B-${questionCount}">B</label>
        </div>
        ${
          options[2]
            ? `
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="C" id="correct-answer-C-${questionCount}" ${
                Array.isArray(correctAnswer) &&
                correctAnswer.includes(options[2])
                  ? "checked"
                  : ""
              }>
            <label class="form-check-label" for="correct-answer-C-${questionCount}">C</label>
          </div>
        `
            : ""
        }
        ${
          options[3]
            ? `
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="D" id="correct-answer-D-${questionCount}" ${
                Array.isArray(correctAnswer) &&
                correctAnswer.includes(options[3])
                  ? "checked"
                  : ""
              }>
            <label class="form-check-label" for="correct-answer-D-${questionCount}">D</label>
          </div>
        `
            : ""
        }
      </div>
      <div class="correct-answer-true-false" id="correct-answer-true-false-${questionCount}" style="display: none;">
        <select class="form-control">
          <option value="True" ${
            correctAnswer === "True" ? "selected" : ""
          }>True</option>
          <option value="False" ${
            correctAnswer === "False" ? "selected" : ""
          }>False</option>
        </select>
      </div>
      <div class="correct-answer-open-ended" id="correct-answer-open-ended-${questionCount}" style="display: none;">
        <div class="alert alert-info">
          This is an open-ended question. There is no correct answer specified.
        </div>
      </div>
    </div>
    <button type="button" class="btn btn-danger btn-sm remove-question">
      <i class="bi bi-trash"></i> Remove Question
    </button>
  `;

  // Initialize the question card
  handleQuestionTypeChange(questionCard, questionType);

  // Add event listeners
  questionCard
    .querySelector(".question-type")
    .addEventListener("change", function () {
      handleQuestionTypeChange(questionCard, this.value);
    });

  questionCard
    .querySelector(".remove-question")
    .addEventListener("click", function () {
      questionCard.remove();
      updateQuestionNumbers();
    });

  return questionCard;
};

// Function to update question numbers
const updateQuestionNumbers = () => {
  const questionCards = document.querySelectorAll(".question-card");
  questionCards.forEach((card, index) => {
    card.querySelector("h4").textContent = `Question ${index + 1}`;
  });
};

// Add question button
document.getElementById("add-question").addEventListener("click", function () {
  questionCount++;
  const questionsContainer = document.getElementById("questions-container");
  questionsContainer.appendChild(createQuestionCard(questionCount));
});

// Load test for editing
async function loadTestForEditing(testId) {
  try {
    const token = sessionStorage.getItem("authToken");
    const response = await fetch(
      `http://${base_url}/api/v1/quizzes/${testId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Failed to load test");

    const { data } = await response.json();
    const test = data.quizez;

    document.getElementById("test-title").value = test.title;
    document.getElementById("test-description").value = test.description;
    document.getElementById("time-limit").value = test.timeLimit;

    const questionsContainer = document.getElementById("questions-container");
    questionsContainer.innerHTML = "";

    if (test.questions?.length) {
      test.questions.forEach((question, index) => {
        questionCount = index + 1;
        questionsContainer.appendChild(
          createQuestionCard(questionCount, question)
        );
      });
    } else {
      questionCount = 1;
      questionsContainer.appendChild(createQuestionCard(questionCount));
    }
  } catch (error) {
    errorMessage.textContent = `Error loading test: ${error.message}`;
    errorMessage.classList.remove("d-none");
  }
}

// Form submission handler
document
  .getElementById("create-test-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const questionsContainer = document.getElementById("questions-container");
      const questionCards = document.querySelectorAll(".question-card");
      if (questionCards.length === 0)
        throw new Error("Please add at least one question");

      const testData = {
        title: document.getElementById("test-title").value,
        description: document.getElementById("test-description").value,
        timeLimit: parseInt(document.getElementById("time-limit").value),
        questions: [],
      };

      // Process each question
      for (const card of questionCards) {
        const questionText = card.querySelector(".question-text").value;
        const questionType = card.querySelector(".question-type").value;
        const imageInput = card.querySelector(".question-image");
        const currentPhotoUrl = card.querySelector(".current-photo-url")?.value;

        if (!questionText) throw new Error("Please fill in all question texts");

        // Get options (only for relevant question types)
        let options = [];
        if (questionType !== "open-ended") {
          const optionInputs = card.querySelectorAll(".option-input");
          options = Array.from(optionInputs)
            .map((input) => input.value.trim())
            .filter((val) => val !== "");
          console.log(options);
          // Validate options for non-open-ended questions
          if (questionType !== "true-false" && options.length < 2) {
            throw new Error(
              "Please provide at least two options for multiple choice questions"
            );
          }
        }

        // Get correct answer based on question type
        let correctAnswer = null;
        if (questionType === "single-correct") {
          const selectedOption = card.querySelector(
            ".correct-answer-single select"
          ).value;
          const optionIndex = selectedOption.charCodeAt(0) - 65;
          correctAnswer = options[optionIndex];
        } else if (questionType === "multiple-correct") {
          const checkboxes = card.querySelectorAll(
            ".correct-answer-multiple input:checked"
          );
          correctAnswer = Array.from(checkboxes).map((checkbox) => {
            const optionIndex = checkbox.value.charCodeAt(0) - 65;
            return options[optionIndex];
          });
          console.log(`huj`, correctAnswer);
          if (correctAnswer.length < 2)
            throw new Error("Please select at least two correct answers");
        } else if (questionType === "true-false") {
          correctAnswer = card.querySelector(
            ".correct-answer-true-false select"
          ).value;
        }

        // Handle image upload if new image was selected
        let photoUrl = currentPhotoUrl;
        if (imageInput.files.length > 0) {
          const formData = new FormData();
          formData.append("photos", imageInput.files[0]);

          const uploadResponse = await fetch(`http://${base_url}/upload`, {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) throw new Error("Image upload failed");
          const { photoUrls } = await uploadResponse.json();
          photoUrl = photoUrls[0];
        }

        testData.questions.push({
          questionText,
          questionType,
          correctAnswer,
          options: questionType === "open-ended" ? [] : options,
          photoUrl,
        });
      }

      // Submit the test data
      const token = sessionStorage.getItem("authToken");
      const method = testId ? "PUT" : "POST";
      const url = testId
        ? `http://${base_url}/api/v1/quizzes/${testId}`
        : `http://${base_url}/api/v1/quizzes/`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error?.description || "Failed to save test");
      }

      // Success handling
      success_message.textContent = testId
        ? "Test updated successfully!"
        : "Test created successfully!";
      success_message.classList.remove("d-none");
      errorMessage.classList.add("d-none");

      if (!testId) {
        questionsContainer.innerHTML = "";
        questionCount = 0;
        this.reset();
      }

      // window.scrollTo(0, 0);
      if (testId)
        setTimeout(
          () => (window.location.href = `viewTest.html?id=${testId}`),
          100
        );
    } catch (error) {
      errorMessage.textContent = error.message;
      errorMessage.classList.remove("d-none");
      success_message.classList.add("d-none");
      // window.scrollTo(0, 0);
    }
  });

// Check if we're editing an existing test
const urlParams = new URLSearchParams(window.location.search);
const testId = urlParams.get("id");

if (testId) {
  document.getElementById("page-title").textContent = "Edit Test";
  document.getElementById(
    "save-test"
  ).innerHTML = `<i class="bi bi-save"></i> Update Test`;
  loadTestForEditing(testId);
} else {
  // Add initial question if creating new test
  questionCount = 1;
  document
    .getElementById("questions-container")
    .appendChild(createQuestionCard(questionCount));
}

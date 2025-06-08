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
    correctAnswerTrueFalse.style.display = "block";
    toggleRequired(correctAnswerTrueFalse.querySelector("select"), true);
  } else if (questionType === "open-ended") {
    correctAnswerOpenEnded.style.display = "block";
    correctAnswerLabel.style.display = "none";
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
  const options = questionData ? questionData.options : ["", "", "", ""];
  let correctAnswer = questionData ? questionData.correctAnswer : "";

  // Handle photoUrl based on the data structure
  let photoUrl = null;
  if (questionData) {
    // Direct photoUrl property
    photoUrl = questionData.photoUrl;
  }


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
        photoUrl
          ? `
        <div class="mt-2">
          <div class="current-image-container">
            <img src="${photoUrl}" alt="Question Image" class="img-thumbnail" style="max-height: 150px;"/>
            <div class="mt-1">
              <small class="text-muted">Current image: ${photoUrl
                .split("/")
                .pop()}</small>
            </div>
          </div>
        </div>`
          : ""
      }
      ${
        photoUrl
          ? `<input type="hidden" class="current-photo-url" value="${photoUrl}">`
          : ""
      }
    </div>
    
    <div class="mb-3">
      <label for="question-type-${questionCount}" class="form-label">Question Type</label>
      <select class="form-control question-type" id="question-type-${questionCount}" required>
        <option value="single-correct" ${
          questionType === "single-correct" ? "selected" : ""
        }>Single Correct Answer (A, B, C, D)</option>
        <option value="multiple-correct" ${
          questionType === "multiple-correct" ? "selected" : ""
        }>Multiple Correct Answers (A, B, C, D)</option>
        <option value="true-false" ${
          questionType === "true-false" ? "selected" : ""
        }>True/False</option>
        <option value="open-ended" ${
          questionType === "open-ended" ? "selected" : ""
        }>Open Ended (No Correct Answer)</option>
      </select>
    </div>
    
    <div class="mb-3 options-container" id="options-container-${questionCount}">
      <label class="form-label">Options (A, B, C, D)</label>
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
      <div class="mb-2">
        <input
          type="text"
          class="form-control option-input"
          placeholder="Option C"
          value="${options[2] || ""}"
          required
        />
      </div>
      <div class="mb-2">
        <input
          type="text"
          class="form-control option-input"
          placeholder="Option D"
          value="${options[3] || ""}"
          required
        />
      </div>
    </div>
    
    <div class="mb-3 correct-answer-container" id="correct-answer-container-${questionCount}">
      <label class="form-label correct-answer-label">Correct Answer</label>
      <div class="correct-answer-single" id="correct-answer-single-${questionCount}">
        <select class="form-control">
          <option value="A" ${
            correctAnswer === "A" ? "selected" : ""
          }>A</option>
          <option value="B" ${
            correctAnswer === "B" ? "selected" : ""
          }>B</option>
          <option value="C" ${
            correctAnswer === "C" ? "selected" : ""
          }>C</option>
          <option value="D" ${
            correctAnswer === "D" ? "selected" : ""
          }>D</option>
        </select>
      </div>
      <div class="correct-answer-multiple" id="correct-answer-multiple-${questionCount}" style="display: none;">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="A" id="correct-answer-A-${questionCount}" ${
    Array.isArray(correctAnswer) && correctAnswer.includes("A") ? "checked" : ""
  }>
          <label class="form-check-label" for="correct-answer-A-${questionCount}">A</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="B" id="correct-answer-B-${questionCount}" ${
    Array.isArray(correctAnswer) && correctAnswer.includes("B") ? "checked" : ""
  }>
          <label class="form-check-label" for="correct-answer-B-${questionCount}">B</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="C" id="correct-answer-C-${questionCount}" ${
    Array.isArray(correctAnswer) && correctAnswer.includes("C") ? "checked" : ""
  }>
          <label class="form-check-label" for="correct-answer-C-${questionCount}">C</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="D" id="correct-answer-D-${questionCount}" ${
    Array.isArray(correctAnswer) && correctAnswer.includes("D") ? "checked" : ""
  }>
          <label class="form-check-label" for="correct-answer-D-${questionCount}">D</label>
        </div>
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

  // Add event listener for question type change
  const questionTypeSelect = questionCard.querySelector(".question-type");
  questionTypeSelect.addEventListener("change", function () {
    handleQuestionTypeChange(questionCard, this.value);
  });

  // Add event listener for remove button
  const removeButton = questionCard.querySelector(".remove-question");
  removeButton.addEventListener("click", function () {
    questionCard.remove();
    updateQuestionNumbers();
  });

  // Initialize the question card based on the question type
  handleQuestionTypeChange(questionCard, questionType);

  return questionCard;
};

// Function to update question numbers after removing a question
const updateQuestionNumbers = () => {
  const questionCards = document.querySelectorAll(".question-card");
  questionCards.forEach((card, index) => {
    card.querySelector("h4").textContent = `Question ${index + 1}`;
  });
};

// Function to add a new question
document.getElementById("add-question").addEventListener("click", function () {
  questionCount++;
  const questionsContainer = document.getElementById("questions-container");
  const questionCard = createQuestionCard(questionCount);
  questionsContainer.appendChild(questionCard);
});

// Function to load an existing test for editing
async function loadTestForEditing(testId) {
  try {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    const response = await fetch(
      `http://${base_url}/api/v1/quizzes/${testId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const testData = await response.json();

    if (!testData.success) {
      throw new Error(
        testData.error?.description || "Failed to load test data"
      );
    }

    const test = testData.data.quizez;
    document.getElementById("test-id").value = test.id;
    document.getElementById("test-title").value = test.title;
    document.getElementById("test-description").value = test.description;
    document.getElementById("time-limit").value = test.timeLimit;

    const questionsContainer = document.getElementById("questions-container");
    questionsContainer.innerHTML = "";

    if (test.questions && test.questions.length > 0) {
      test.questions.forEach((question, index) => {
        questionCount = index + 1;
        const questionCard = createQuestionCard(questionCount, question);
        questionsContainer.appendChild(questionCard);
      });
    } else {
      // If no questions, add an empty one
      questionCount = 1;
      const questionCard = createQuestionCard(questionCount);
      questionsContainer.appendChild(questionCard);
    }
  } catch (error) {
    console.error("Error loading test:", error);
    errorMessage.innerHTML = `Error loading test: ${error.message}`;
    errorMessage.classList.remove("d-none");
  }
}

// Check if we are editing an existing test
const urlParams = new URLSearchParams(window.location.search);
const testId = urlParams.get("id");

if (testId) {
  document.getElementById("page-title").innerText = "Edit Test";
  document.getElementById(
    "save-test"
  ).innerHTML = `<i class="bi bi-save"></i> Update Test`;
  loadTestForEditing(testId);
}

// Form submission handler
document
  .getElementById("create-test-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const questionsContainer = document.getElementById("questions-container");
      const testTitle = document.getElementById("test-title").value;
      const testDescription = document.getElementById("test-description").value;
      const timeLimit = document.getElementById("time-limit").value;
      // const testId = document.getElementById("test-id").value;

      const questionCards = document.querySelectorAll(".question-card");

      if (questionCards.length === 0) {
        throw new Error("Please add at least one question.");
      }

      // Process each question card
      const questions = [];

      for (let i = 0; i < questionCards.length; i++) {
        const card = questionCards[i];
        const questionNumber = i + 1;
        const questionText = card.querySelector(".question-text").value;
        const questionType = card.querySelector(".question-type").value;
        const imageInput = card.querySelector(".question-image");
        let currentPhotoUrlInput = card.querySelector(".current-photo-url");
        let currentPhotoUrl = currentPhotoUrlInput
          ? currentPhotoUrlInput.value
          : null;

        if (!questionText) {
          throw new Error(
            `Question ${questionNumber}: Please enter question text.`
          );
        }

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
            throw new Error(
              `Question ${questionNumber}: Please select at least one correct answer.`
            );
          }
        } else if (questionType === "true-false") {
          correctAnswer = card.querySelector(
            ".correct-answer-true-false select"
          ).value;
        }
        // Open-ended questions don't need a correct answer

        const optionInputs = card.querySelectorAll(".option-input");
        const options =
          questionType !== "true-false" && questionType !== "open-ended"
            ? Array.from(optionInputs).map((input) => input.value)
            : [];

        // Validate options for non-true-false questions
        if (questionType !== "true-false" && questionType !== "open-ended") {
          for (let j = 0; j < options.length; j++) {
            if (!options[j]) {
              throw new Error(
                `Question ${questionNumber}: Please fill in all options.`
              );
            }
          }
        }

        // Handle image upload if new image is selected
        let photoUrl = currentPhotoUrl;
        if (imageInput.files.length > 0) {
          const imageFile = imageInput.files[0];
          const imageFormData = new FormData();
          imageFormData.append("photos", imageFile);

          try {
            const uploadResponse = await fetch(`http://192.168.0.113:3007/upload`, {
              method: "POST",
              body: imageFormData,
            });

            if (!uploadResponse.ok) {
              throw new Error(
                `Image upload failed for question ${questionNumber}`
              );
            }

            const uploadResult = await uploadResponse.json();
            photoUrl = uploadResult.photoUrls[0];
          } catch (error) {
            console.error("Error uploading image:", error);
            throw new Error(
              `Error uploading image for question ${questionNumber}: ${error.message}`
            );
          }
        }

        questions.push({
          questionText,
          questionType,
          correctAnswer,
          options,
          photoUrl,
        });
      }

      const testData = {
        title: testTitle,
        description: testDescription,
        timeLimit: parseInt(timeLimit, 10),
        questions,
      };

      const token = sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
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

      const successStatusCodes = [200, 201, 204];
      if (!successStatusCodes.includes(response.status)) {
        const responseData = await response.json();
        throw new Error(
          responseData.error?.description || "Failed to save test"
        );
      } else {
        // Success handling
        errorMessage.classList.add("d-none");
        success_message.classList.remove("d-none");
        success_message.innerHTML = testId
          ? "Quiz has been updated successfully"
          : "Quiz has been created successfully";

        // Reset form if creating new test
        if (!testId) {
          questionsContainer.innerHTML = "";
          questionCount = 0;
          document.getElementById("create-test-form").reset();
        }

        // Scroll to the top to show the success message
        window.scrollTo(0, 0);

        // Redirect if we have a test ID
        if (testId) {
          window.location.href = `viewTest.html?id=${testId}`;
        }
      }
    } catch (error) {
      console.error("Error saving test:", error);
      success_message.classList.add("d-none");
      errorMessage.innerHTML = error.message;
      errorMessage.classList.remove("d-none");

      // Scroll to the top to show the error message
      window.scrollTo(0, 0);
    }
  });

import { base_url } from "./base_api.js";

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
      </div>
      
      <div class="mb-3">
        <label for="question-type-${questionCount}" class="form-label">Question Type</label>
        <select class="form-control question-type" id="question-type-${questionCount}" required>
          <option value="single-correct">Single Correct Answer (A, B, C, D)</option>
          <option value="multiple-correct">Multiple Correct Answers (A, B, C, D)</option>
          <option value="true-false">True/False</option>
          <option value="open-ended">Open Ended (No Correct Answer)</option>
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
        <label class="form-label correct-answer-label">Correct Answer</label>
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
  const correctAnswerOpenEnded = questionCard.querySelector(
    ".correct-answer-open-ended"
  );
  const correctAnswerLabel = questionCard.querySelector(
    ".correct-answer-label"
  );

  // Function to toggle required attribute
  const toggleRequired = (element, isRequired) => {
    if (isRequired) {
      element.setAttribute("required", true);
    } else {
      element.removeAttribute("required");
    }
  };

  // Function to handle question type changes
  const handleQuestionTypeChange = () => {
    const optionInputs = questionCard.querySelectorAll(".option-input");

    if (questionType.value === "single-correct") {
      optionsContainer.style.display = "block";
      correctAnswerSingle.style.display = "block";
      correctAnswerMultiple.style.display = "none";
      correctAnswerTrueFalse.style.display = "none";
      correctAnswerOpenEnded.style.display = "none";
      correctAnswerLabel.style.display = "block";
      toggleRequired(correctAnswerSingle.querySelector("select"), true);
      optionInputs.forEach((input) => toggleRequired(input, true));
    } else if (questionType.value === "multiple-correct") {
      optionsContainer.style.display = "block";
      correctAnswerSingle.style.display = "none";
      correctAnswerMultiple.style.display = "block";
      correctAnswerTrueFalse.style.display = "none";
      correctAnswerOpenEnded.style.display = "none";
      correctAnswerLabel.style.display = "block";
      toggleRequired(
        correctAnswerMultiple.querySelectorAll("input[type='checkbox']")[0],
        true
      );
      optionInputs.forEach((input) => toggleRequired(input, true));
    } else if (questionType.value === "true-false") {
      optionsContainer.style.display = "none";
      correctAnswerSingle.style.display = "none";
      correctAnswerMultiple.style.display = "none";
      correctAnswerTrueFalse.style.display = "block";
      correctAnswerOpenEnded.style.display = "none";
      correctAnswerLabel.style.display = "block";
      toggleRequired(correctAnswerTrueFalse.querySelector("select"), true);
      optionInputs.forEach((input) => toggleRequired(input, false));
    } else if (questionType.value === "open-ended") {
      optionsContainer.style.display = "none";
      correctAnswerSingle.style.display = "none";
      correctAnswerMultiple.style.display = "none";
      correctAnswerTrueFalse.style.display = "none";
      correctAnswerOpenEnded.style.display = "block";
      correctAnswerLabel.style.display = "none";
      optionInputs.forEach((input) => toggleRequired(input, false));
    }
  };

  // Initialize based on default question type
  handleQuestionTypeChange();

  // Add event listener for question type change
  questionType.addEventListener("change", handleQuestionTypeChange);

  // Add event listener for remove question button
  questionCard
    .querySelector(".remove-question")
    .addEventListener("click", function () {
      questionCard.remove();
      // Update question numbers if needed
      updateQuestionNumbers();
    });
});

// Function to update question numbers after removal
function updateQuestionNumbers() {
  const questionCards = document.querySelectorAll(".question-card");
  questionCards.forEach((card, index) => {
    card.querySelector("h4").textContent = `Question ${index + 1}`;
  });
}

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

    // Process each question card
    for (const card of questionCards) {
      const questionText = card.querySelector(".question-text").value;
      const questionType = card.querySelector(".question-type").value;
      const imageInput = card.querySelector(".question-image");
      let correctAnswer = null;
      let imageFile = null;

      // Handle image upload if present
      if (imageInput.files.length > 0) {
        imageFile = imageInput.files[0];
      }

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
            `Question ${
              questions.length + 1
            }: Please select at least one correct answer for multiple choice questions.`
          );
          break;
        }
      } else if (questionType === "true-false") {
        correctAnswer = card.querySelector(
          ".correct-answer-true-false select"
        ).value;
      }
      // Open-ended questions don't need a correct answer

      const options =
        questionType !== "true-false" && questionType !== "open-ended"
          ? Array.from(card.querySelectorAll(".option-input")).map(
              (input) => input.value
            )
          : [];

      questions.push({
        questionText,
        questionType,
        correctAnswer,
        options,
        imageFile, // This will be handled in the FormData version
      });
    }

    if (!isValid) {
      return;
    }

    // Create FormData to handle file uploads
    const token = sessionStorage.getItem("authToken");

    const formData = new FormData();
    formData.append("title", testTitle);
    formData.append("description", testDescription);
    formData.append("timeLimit", timeLimit);

    const questionsWithoutFiles = await Promise.all(
      questions.map(async (q) => {
        let photoUrl = null;
        if (q.imageFile) {
          const imageFormData = new FormData();
          imageFormData.append("photos", q.imageFile); // "photos" is the expected field name
          const uploadResponse = await fetch(`http://localhost:3007/upload`, {
            method: "POST",
            body: imageFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error("Image upload failed");
          }

          const uploadResult = await uploadResponse.json();
          photoUrl = uploadResult.photoUrls[0];
        }

        return {
          photoUrl: photoUrl,
          questionText: q.questionText,
          questionType: q.questionType,
          correctAnswer: q.correctAnswer,
          options: q.options,
        };
      })
    );
  
    const bodyData = {};
    for (let [key, value] of formData.entries()) {
      bodyData[key] = value;
    }
    bodyData["questions"] = questionsWithoutFiles;
    try {
      const response = await fetch(`http://${base_url}/api/v1/quizzes/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });
      if (response.status !== 201) {
        const responseData = await response.json();
        success_message.classList.add("d-none");
        errorMessage.innerHTML =
          responseData.error?.description || "Failed to create quiz";
        errorMessage.classList.remove("d-none");
      } else {
        errorMessage.classList.add("d-none");
        document.getElementById("create-test-form").reset();
        success_message.classList.remove("d-none");
        success_message.innerHTML = "Quiz has been created successfully";
        questionsContainer.innerHTML = "";
        questionCount = 0; // Reset question counter
      }
    } catch (error) {
      console.error("Error:", error);
      success_message.classList.add("d-none");
      errorMessage.innerHTML = "An error occurred while creating the quiz";
      errorMessage.classList.remove("d-none");
    }
  });

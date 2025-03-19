import { base_url } from "./base_api.js";

const testDetails = document.getElementById("test-details");

// Function to fetch and display test details
async function fetchTestDetails() {
  const testId = new URLSearchParams(window.location.search).get("id");
  if (!testId) {
    alert("Test ID not found.");
    return;
  }

  const token = sessionStorage.getItem("authToken");
  const response = await fetch(`http://${base_url}/api/v1/quizez/${testId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (data.success) {
    const test = data.data.quizez;
    testDetails.innerHTML = `
      <h2>${test.title}</h2>
      <p>${test.description}</p>
      <div class="test-meta">
        <span><i class="bi bi-clock"></i>${test.timeLimit} mins</span>
        <span><i class="bi bi-question-circle"></i>${test.questions.length} questions</span>
      </div>
      <div id="questions-container">
        ${test.questions
          .map(
            (question, index) => `
            <div class="question-card">
              <h4>Question ${index + 1}: ${question.questionText}</h4>
              <div class="options">
                ${question.options
                  .map(
                    (option, i) => `
                    <div class="option">
                      <input
                        type="${question.questionType === "multiple-correct" ? "checkbox" : "radio"}"
                        name="question-${index}"
                        id="question-${index}-option-${i}"
                        disabled
                      />
                      <label for="question-${index}-option-${i}">${String.fromCharCode(65 + i)}. ${option}</label>
                    </div>
                  `
                  )
                  .join("")}
              </div>
              <p class="correct-answer">
                Correct Answer: ${Array.isArray(question.correctAnswer)
                  ? question.correctAnswer.join(", ")
                  : question.correctAnswer}
              </p>
            </div>
          `
          )
          .join("")}
      </div>
    `;
  } else {
    alert("Failed to fetch test details.");
  }
}

// Fetch test details on page load
fetchTestDetails();
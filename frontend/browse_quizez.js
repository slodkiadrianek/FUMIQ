import { baser_url } from "./base_api";
const testList = document.getElementById("test-list");

// Function to fetch and display tests
async function fetchTests() {
  const token = sessionStorage.getItem("authToken");
  const response = await fetch(`http://${baser_url}/api/v1/quizez/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();

  if (data.success) {
    testList.innerHTML = ""; // Clear existing content
    data.data.quizez.forEach((test) => {
      const testCard = document.createElement("div");
      testCard.className = "test-card animate__animated animate__fadeInUp";
      testCard.innerHTML = `
        <h4><i class="bi bi-file-earmark-text"></i>${test.title}</h4>
        <p>${test.description}</p>
        <div class="test-meta">
          <span><i class="bi bi-clock"></i>${test.timeLimit} mins</span>
          <span><i class="bi bi-question-circle"></i>${test.questions.length} questions</span>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary rounded" onclick="viewTest('${test._id}')">
            <i class="bi bi-eye"></i> View
          </button>
          <button class="btn btn-secondary rounded" onclick="editTest('${test._id}')">
            <i class="bi bi-pencil"></i> Edit
          </button>
          <button class="btn btn-danger rounded" onclick="deleteTest('${test._id}')">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      `;
      testList.appendChild(testCard);
    });
  } else {
    alert("Failed to fetch tests.");
  }
}

// Function to view a test
function viewTest(testId) {
  window.location.href = `view_test.html?id=${testId}`;
}

// Function to edit a test
function editTest(testId) {
  window.location.href = `edit_test.html?id=${testId}`;
}

// Function to delete a test
async function deleteTest(testId) {
  const token = sessionStorage.getItem("authToken");
  const response = await fetch(
    `http://${baser_url}/api/v1/quiz/${testId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  if (data.success) {
    alert("Test deleted successfully.");
    fetchTests(); // Refresh the list
  } else {
    alert("Failed to delete test.");
  }
}

// Fetch tests on page load
fetchTests();

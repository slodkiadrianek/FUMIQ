import { base_url } from "./base_api.js";
const testList = document.getElementById("test-list");
// console.log(`hello world`)
// Function to fetch and display tests
async function fetchTests() {
  const token = sessionStorage.getItem("authToken");
  const response = await fetch(`http://${base_url}/api/v1/quizez/`, {
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
          <a href="viewTest.html?id=${test._id}" class="btn btn-primary rounded" data-test-id="${test._id}">
            <i class="bi bi-eye"></i> View
          </a>
          <a class="btn btn-secondary rounded" data-test-id="${test._id}">
            <i class="bi bi-pencil"></i> Edit
          </a>
          <a class="btn btn-danger rounded" data-test-id="${test._id}">
            <i class="bi bi-trash"></i> Delete
          </a>
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
  window.location.href = `viewTest.html?id=${testId}`;
}

// Function to edit a test
function editTest(testId) {
  window.location.href = `editTest.html?id=${testId}`;
}

// Function to delete a test
async function deleteTest(testId) {
  const token = sessionStorage.getItem("authToken");
  const response = await fetch(`http://${base_url}/api/v1/quizez/${testId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (data.success) {
    alert("Test deleted successfully.");
    fetchTests(); // Refresh the list
  } else {
    alert("Failed to delete test.");
  }
}
document.getElementById("test-list").addEventListener("click", (event) => {
  // Check if the clicked element is the Delete button
  if (event.target.classList.contains("btn-danger")) {
    const testId = event.target.getAttribute("data-test-id");
    deleteTest(testId);
  }

  // Check if the clicked element is the Edit button
  if (event.target.classList.contains("btn-secondary")) {
    const testId = event.target.getAttribute("data-test-id");
    editTest(testId);
  }

  // Check if the clicked element is the View button
  if (event.target.classList.contains("btn-primary")) {
    const testId = event.target.getAttribute("data-test-id");
    viewTest(testId);
  }
});

// Fetch tests on page load
fetchTests();

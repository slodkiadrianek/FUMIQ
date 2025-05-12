// Fetch user data from an API
import { base_url } from "./base_api.js";
async function fetchUserData() {
  try {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const token = sessionStorage.getItem("authToken");
    const response = await fetch(
      `http://${base_url}/api/v1/users/${userData.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    ); // Replace with your API endpoint
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

// Fetch test results from an API
async function fetchTestResults() {
  try {
    const response = await fetch("https://api.example.com/results"); // Replace with your API endpoint
    if (!response.ok) {
      throw new Error("Failed to fetch test results");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching test results:", error);
    return null;
  }
}

// Update the profile card with fetched data
async function updateProfile() {
  const userData = await fetchUserData();
  if (userData) {
    const date = new Date(userData.data.user.createdAt);
    document.getElementById("userName").textContent =
      `${userData.data.user.firstname} ${userData.data.user.lastname}`;
    document.getElementById("userEmail").textContent = userData.data.user.email;
    document.getElementById("joinDate").textContent =
      `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`;
    document.getElementById("testsCreated").textContent =
      userData.data.user.testsCreated;
    document.getElementById("testsCompleted").textContent =
      userData.data.user.testsCompleted;
  }
}

// Render charts with fetched data
async function renderCharts() {
  const testResults = await fetchTestResults();
  if (testResults) {
    // Performance Chart (Line Chart)
    const performanceCtx = document
      .getElementById("performanceChart")
      .getContext("2d");
    const performanceChart = new Chart(performanceCtx, {
      type: "line",
      data: {
        labels: testResults.performance.labels,
        datasets: [
          {
            label: "Test Scores",
            data: testResults.performance.data,
            borderColor: "rgba(79, 70, 229, 1)",
            backgroundColor: "rgba(79, 70, 229, 0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    });

    // Results Distribution Chart (Pie Chart)
    const resultsCtx = document.getElementById("resultsChart").getContext("2d");
    const resultsChart = new Chart(resultsCtx, {
      type: "pie",
      data: {
        labels: testResults.distribution.labels,
        datasets: [
          {
            label: "Test Results",
            data: testResults.distribution.data,
            backgroundColor: [
              "rgba(79, 70, 229, 0.8)",
              "rgba(239, 68, 68, 0.8)",
              "rgba(107, 114, 128, 0.8)",
            ],
            borderColor: [
              "rgba(79, 70, 229, 1)",
              "rgba(239, 68, 68, 1)",
              "rgba(107, 114, 128, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
      },
    });
  }
}

// Initialize the page
async function init() {
  await updateProfile();
  await renderCharts();
}
await fetchUserData();

// Run the initialization function
init();

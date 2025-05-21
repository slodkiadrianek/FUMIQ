// import { base_url } from "./base_api.js";
// const token = sessionStorage.getItem("authToken");
// const urlParams = new URLSearchParams(window.location.search);
// const quizId = urlParams.get("id");

// async function fetchQuizData(token) {
//   const response = await fetch(`http://${base_url}/api/v1/quizzes/${quizId}`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   const responseData = await response.json();
//   if (!responseData.success) {
//     console.error(responseData.data.error.description);
//   }
//   return responseData;
// }

// async function fetchSessionsData(token) {
//   const response = await fetch(
//     `http://${base_url}/api/v1/quizzes/${quizId}/sessions`,
//     {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
//   const responseData = await response.json();
//   if (!responseData.success) {
//     console.error(responseData.data.error.description);
//   }
//   console.log(responseData);
//   return responseData;
// }

// document.addEventListener("DOMContentLoaded", async function async() {
//   const quizData = await fetchQuizData(token);
//   const sessionData = await fetchSessionsData(token);
//   const exampleQuiz = {
//     id: 123,
//     title: "Mathematics Basics",
//     description:
//       "Test your algebra and geometry skills with this comprehensive quiz",
//     createdBy: "Professor Johnson",
//   };

//   const exampleSessions = [
//     {
//       id: 1,
//       quizId: 123,
//       name: "Class A - Final Exam",
//       startTime: "2023-06-15T09:00:00",
//       endTime: "2023-06-15T10:30:00",
//       participantCount: 24,
//       status: "completed",
//     },
//     {
//       id: 2,
//       quizId: 123,
//       name: "Class B - Practice Session",
//       startTime: "2023-06-16T14:00:00",
//       endTime: null, // Ongoing session
//       participantCount: 18,
//       status: "active",
//     },
//     {
//       id: 3,
//       quizId: 123,
//       name: "Summer Course - Quiz 1",
//       startTime: "2023-07-01T10:00:00",
//       endTime: "2023-07-01T11:00:00",
//       participantCount: 32,
//       status: "scheduled",
//     },
//     {
//       id: 4,
//       quizId: 123,
//       name: "Makeup Exam Session",
//       startTime: "2023-06-20T13:00:00",
//       endTime: "2023-06-20T14:30:00",
//       participantCount: 8,
//       status: "completed",
//     },
//   ];

//   // DOM elements
//   const quizTitle = document.getElementById("quizTitle");
//   const quizDescription = document.getElementById("quizDescription");
//   const sessionsContainer = document.getElementById("sessionsContainer");

//   // Display quiz info
//   quizTitle.textContent = quizData.data.quizez.title;
//   quizDescription.textContent = quizData.data.quizez.description;

//   // Display sessions
//   displaySessions(sessionData.data.sessions);

//   // Function to display sessions
//   function displaySessions(sessions) {
//     if (sessions.length === 0) {
//       sessionsContainer.innerHTML = `
//                             <div class="empty-state">
//                                 <i class="bi bi-calendar-x"></i>
//                                 <h4>No Sessions Available</h4>
//                                 <p>There are no active sessions for this quiz yet.</p>
//                                 <a href="create_session.html?quizId=${exampleQuiz._id}" class="btn btn-primary mt-2">
//                                     <i class="bi bi-plus-circle"></i> Create New Session
//                                 </a>
//                             </div>
//                         `;
//       return;
//     }

//     let html = "";
//     sessions.forEach((session) => {
//       const startTime = new Date(session.startedAt).toLocaleString();
//       const endTime = session.endedAt
//         ? new Date(session.endedAt).toLocaleString()
//         : "Ongoing";

//       html += `
//                             <div class="session-card">
//                                 <div class="session-meta">
//                                     <div class="session-meta-item">
//                                         <i class="bi bi-calendar"></i>
//                                         <span>${startTime}</span>
//                                     </div>
//                                     <div class="session-meta-item">
//                                         <i class="bi bi-clock"></i>
//                                         <span>${endTime}</span>
//                                     </div>
//                                     <div class="session-meta-item">
//                                         <i class="bi bi-people"></i>
//                                         <span>${session.amountOfParticipants} participants</span>
//                                     </div>
//                                 </div>
//                                 <div class="session-actions">
//                                     <a href="viewResults.html?sessionId=${session.id}&quizId=${session.quizId}" class="btn btn-primary">
//                                         <i class="bi bi-eye"></i> View Details
//                                     </a>
//                                 </div>
//                             </div>
//                         `;
//     });

//     sessionsContainer.innerHTML = html;
//   }
// });
import { base_url } from "./base_api.js";

// Error messages container
const errorMessages = {
  noToken: "Authentication required. Please log in.",
  noQuizId: "No quiz specified. Please select a quiz.",
  fetchError: "Failed to load data. Please try again later.",
  serverError: "Server error occurred. Please contact support.",
  sessionError: "Failed to load sessions.",
};

// DOM elements
const quizTitle = document.getElementById("quizTitle");
const quizDescription = document.getElementById("quizDescription");
const sessionsContainer = document.getElementById("sessionsContainer");

// Get authentication token and quiz ID
const token = sessionStorage.getItem("authToken");
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get("id");

// Helper function to show error state
function showError(message, showBackButton = true) {
  sessionsContainer.innerHTML = `
        <div class="empty-state">
            <i class="bi bi-exclamation-triangle"></i>
            <h4>Error</h4>
            <p>${message}</p>
            ${
              showBackButton
                ? `
            <a href="browse_quizez.html" class="btn btn-primary mt-2">
                <i class="bi bi-arrow-left"></i> Back to Quizzes
            </a>`
                : ""
            }
        </div>
    `;
}

// Helper function to show loading state
function showLoading() {
  sessionsContainer.innerHTML = `
        <div class="empty-state">
            <i class="bi bi-hourglass-split"></i>
            <h4>Loading...</h4>
        </div>
    `;
}

// Enhanced fetch with error handling
async function fetchWithAuth(url, options = {}) {
  if (!token) {
    throw new Error(errorMessages.noToken);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorMessages.fetchError);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

// Fetch quiz data
async function fetchQuizData() {
  if (!quizId) {
    throw new Error(errorMessages.noQuizId);
  }

  try {
    const response = await fetchWithAuth(
      `http://${base_url}/api/v1/quizzes/${quizId}`
    );

    if (!response.success) {
      throw new Error(
        response.data?.error?.description || errorMessages.fetchError
      );
    }

    return response.data.quizez;
  } catch (error) {
    console.error("Quiz data error:", error);
    throw error;
  }
}

// Fetch sessions data
async function fetchSessionsData() {
  try {
    const response = await fetchWithAuth(
      `http://${base_url}/api/v1/quizzes/${quizId}/sessions`
    );

    if (!response.success) {
      throw new Error(
        response.data?.error?.description || errorMessages.sessionError
      );
    }

    return response.data.sessions || [];
  } catch (error) {
    console.error("Sessions data error:", error);
    throw error;
  }
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return "Not specified";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleString(undefined, options);
}

// Display sessions
function displaySessions(sessions) {
  if (!sessions || sessions.length === 0) {
    sessionsContainer.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-calendar-x"></i>
                <h4>No Sessions Available</h4>
                <p>There are no active sessions for this quiz yet.</p>
            </div>
        `;
    return;
  }

  let html = "";
  sessions.forEach((session) => {
    const startTime = formatDate(session.startedAt);
    const endTime = formatDate(session.endedAt) || "Ongoing";

    html += `
            <div class="session-card">
                <div class="session-meta">
                    <div class="session-meta-item">
                        <i class="bi bi-calendar"></i>
                        <span>Started: ${startTime}</span>
                    </div>
                    <div class="session-meta-item">
                        <i class="bi bi-clock"></i>
                        <span>Ended: ${endTime}</span>
                    </div>
                    <div class="session-meta-item">
                        <i class="bi bi-people"></i>
                        <span>${
                          session.amountOfParticipants || 0
                        } participants</span>
                    </div>
                </div>
                <div class="session-actions">
                    <a href="viewResults.html?sessionId=${session.id}&quizId=${
      session.quizId
    }" 
                       class="btn btn-primary">
                        <i class="bi bi-eye"></i> View Details
                    </a>
                </div>
            </div>
        `;
  });

  sessionsContainer.innerHTML = html;
}

// Main initialization function
async function initializePage() {
  try {
    // Validate we have required data
    if (!token) {
      showError(errorMessages.noToken, true);
      return;
    }

    if (!quizId) {
      showError(errorMessages.noQuizId, true);
      return;
    }

    showLoading();

    // Load data in parallel
    const [quiz, sessions] = await Promise.all([
      fetchQuizData(),
      fetchSessionsData(),
    ]);

    // Update UI
    quizTitle.textContent = quiz.title;
    quizDescription.textContent =
      quiz.description || "All available sessions for this quiz";
    displaySessions(sessions);
  } catch (error) {
    console.error("Initialization error:", error);
    showError(error.message || errorMessages.serverError, true);
  }
}

// Start the page initialization
document.addEventListener("DOMContentLoaded", initializePage);

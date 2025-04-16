import { base_url } from "./base_api.js";
document.addEventListener("DOMContentLoaded", function async() {
      const token = sessionStorage.getItem("authToken");

    const response = await fetch(`http://${base_url}/api/v1/quizez/${quizId}`)
    
  const exampleQuiz = {
    id: 123,
    title: "Mathematics Basics",
    description:
      "Test your algebra and geometry skills with this comprehensive quiz",
    createdBy: "Professor Johnson",
  };

  const exampleSessions = [
    {
      id: 1,
      quizId: 123,
      name: "Class A - Final Exam",
      startTime: "2023-06-15T09:00:00",
      endTime: "2023-06-15T10:30:00",
      participantCount: 24,
      status: "completed",
    },
    {
      id: 2,
      quizId: 123,
      name: "Class B - Practice Session",
      startTime: "2023-06-16T14:00:00",
      endTime: null, // Ongoing session
      participantCount: 18,
      status: "active",
    },
    {
      id: 3,
      quizId: 123,
      name: "Summer Course - Quiz 1",
      startTime: "2023-07-01T10:00:00",
      endTime: "2023-07-01T11:00:00",
      participantCount: 32,
      status: "scheduled",
    },
    {
      id: 4,
      quizId: 123,
      name: "Makeup Exam Session",
      startTime: "2023-06-20T13:00:00",
      endTime: "2023-06-20T14:30:00",
      participantCount: 8,
      status: "completed",
    },
  ];

  // DOM elements
  const quizTitle = document.getElementById("quizTitle");
  const quizDescription = document.getElementById("quizDescription");
  const sessionsContainer = document.getElementById("sessionsContainer");

  // Display quiz info
  quizTitle.textContent = exampleQuiz.title;
  quizDescription.textContent = exampleQuiz.description;

  // Display sessions
  displaySessions(exampleSessions);

  // Function to display sessions
  function displaySessions(sessions) {
    if (sessions.length === 0) {
      sessionsContainer.innerHTML = `
                            <div class="empty-state">
                                <i class="bi bi-calendar-x"></i>
                                <h4>No Sessions Available</h4>
                                <p>There are no active sessions for this quiz yet.</p>
                                <a href="create_session.html?quizId=${exampleQuiz.id}" class="btn btn-primary mt-2">
                                    <i class="bi bi-plus-circle"></i> Create New Session
                                </a>
                            </div>
                        `;
      return;
    }

    let html = "";
    sessions.forEach((session) => {
      const startTime = new Date(session.startTime).toLocaleString();
      const endTime = session.endTime
        ? new Date(session.endTime).toLocaleString()
        : "Ongoing";

      html += `
                            <div class="session-card">
                                <div class="session-title">${session.name}</div>
                                <div class="session-meta">
                                    <div class="session-meta-item">
                                        <i class="bi bi-calendar"></i>
                                        <span>${startTime}</span>
                                    </div>
                                    <div class="session-meta-item">
                                        <i class="bi bi-clock"></i>
                                        <span>${endTime}</span>
                                    </div>
                                    <div class="session-meta-item">
                                        <i class="bi bi-people"></i>
                                        <span>${session.participantCount} participants</span>
                                    </div>
                                </div>
                                <div class="session-actions">
                                    <a href="session_details.html?id=${session.id}" class="btn btn-primary">
                                        <i class="bi bi-eye"></i> View Details
                                    </a>
                                    <a href="join_session.html?id=${session.id}" class="btn btn-outline-primary">
                                        <i class="bi bi-box-arrow-in-right"></i> Join Session
                                    </a>
                                </div>
                            </div>
                        `;
    });

    sessionsContainer.innerHTML = html;
  }
});

// import { base_url } from "./base_api.js";
// document.addEventListener("DOMContentLoaded", async function () {
//   // Sample data - replace with actual API call
//   const competitors = [
//     { id: 1, name: "Alex Johnson", score: 95, avatar: "AJ" },
//     { id: 2, name: "Maria Garcia", score: 92, avatar: "MG" },
//     { id: 3, name: "James Smith", score: 88, avatar: "JS" },
//     { id: 4, name: "Sarah Williams", score: 85, avatar: "SW" },
//     { id: 5, name: "David Brown", score: 82, avatar: "DB" },
//     { id: 6, name: "Emma Davis", score: 78, avatar: "ED" },
//     { id: 7, name: "Michael Wilson", score: 75, avatar: "MW" },
//     { id: 8, name: "Olivia Martinez", score: 72, avatar: "OM" },
//     { id: 9, name: "Robert Anderson", score: 68, avatar: "RA" },
//     { id: 10, name: "Sophia Taylor", score: 65, avatar: "ST" },
//   ];

//   const participantsList = document.getElementById("participantsList");

//   // Sort competitors by score (descending)
//   competitors.sort((a, b) => b.score - a.score);

//   // Populate the list
//   competitors.forEach((competitor) => {});

//   try {
//     const urlParams = new URLSearchParams(window.location.search);
//     const sessionId = urlParams.get("sessionId");
//     const quizId = urlParams.get("quizId");
//     const token = sessionStorage.getItem("authToken");
//     const response = await fetch(
//       `http://${base_url}/api/v1/quizzes/${quizId}/sessions/${sessionId}/results`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     console.log(response);
//     const responseData = await response.json();
//     if (responseData.success) {
//       console.log(responseData);
//       const quizScore = responseData.data.scores;
//       for (const el of quizScore) {
//         const splitted = el.name.split(" ");
//         const avatar = `${splitted[0][0]}${splitted[1][0]}`.toUpperCase();
//         const participant = document.createElement("div");
//         participant.className = "participant-item";

//         participant.innerHTML = `
//                         <div class="participant-info">
//                             <div class="avatar">${avatar}</div>
//                             <div>${el.name}</div>
//                         </div>
//                         <div class="participant-score">${el.score}%</div>
//                     `;

//         participantsList.appendChild(participant);
//       }
//     } else {
//       throw new Error(requestData.error.description);
//     }
//   } catch (error) {
//     console.error("Submission error:", error);
//     alert("Error during showing results. Please try again.");
//   }
// });
import { base_url } from "./base_api.js";

document.addEventListener("DOMContentLoaded", async function () {
  const participantsList = document.getElementById("participantsList");

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("sessionId");
    const quizId = urlParams.get("quizId");
    const token = sessionStorage.getItem("authToken");

    const response = await fetch(
      `http://${base_url}/api/v1/quizzes/${quizId}/sessions/${sessionId}/results`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const responseData = await response.json();

    if (responseData.success) {
      const quizScore = responseData.data.scores;

      for (const el of quizScore) {
        const splitted = el.name.split(" ");
        const avatar = `${splitted[0][0]}${splitted[1][0]}`.toUpperCase();
        const participant = document.createElement("div");
        participant.className = "participant-item";

        participant.innerHTML = `
          <div class="participant-info">
            <div class="avatar">${avatar}</div>
            <div>${el.name}</div>
          </div>
          <div class="d-flex align-items-center gap-3">
            <div class="participant-score">${el.score}%</div>
            <button class="btn btn-sm btn-primary view-answers-btn" 
        data-user='${JSON.stringify(el)}'>
  <i class="bi bi-eye-fill"></i> View Answers
</button>
          </div>
        `;

        participantsList.appendChild(participant);
      }

      // Add event listeners to all view buttons
      document.querySelectorAll(".view-answers-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const userData = JSON.parse(this.getAttribute("data-user"));
          showUserAnswers(userData);
        });
      });
    } else {
      throw new Error(responseData.error.description);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error during showing results. Please try again.");
  }
});

function showUserAnswers(userData) {
  const modalBody = document.getElementById("answersModalBody");
  const modalTitle = document.getElementById("answersModalLabel");

  // Set modal title
  modalTitle.textContent = `${userData.name}'s Answers (Score: ${userData.score}%)`;

  // Clear previous content
  modalBody.innerHTML = "";

  // Add each answer to the modal
  userData.userAnswers.forEach((answer, index) => {
    const answerItem = document.createElement("div");
    answerItem.className = "answer-item";

    answerItem.innerHTML = `
      <div class="question-text">Question ${index + 1}: ${
      answer.questionText
    }</div>
      <div class="user-answer">
        <strong>Answer:</strong> ${answer.answer || "No answer provided"}
      </div>
    `;

    modalBody.appendChild(answerItem);
  });

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById("answersModal"));
  modal.show();
}

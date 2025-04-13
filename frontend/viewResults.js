document.addEventListener("DOMContentLoaded", function () {
  // Sample data - replace with actual API call
  const competitors = [
    { id: 1, name: "Alex Johnson", score: 95, avatar: "AJ" },
    { id: 2, name: "Maria Garcia", score: 92, avatar: "MG" },
    { id: 3, name: "James Smith", score: 88, avatar: "JS" },
    { id: 4, name: "Sarah Williams", score: 85, avatar: "SW" },
    { id: 5, name: "David Brown", score: 82, avatar: "DB" },
    { id: 6, name: "Emma Davis", score: 78, avatar: "ED" },
    { id: 7, name: "Michael Wilson", score: 75, avatar: "MW" },
    { id: 8, name: "Olivia Martinez", score: 72, avatar: "OM" },
    { id: 9, name: "Robert Anderson", score: 68, avatar: "RA" },
    { id: 10, name: "Sophia Taylor", score: 65, avatar: "ST" },
  ];

  const participantsList = document.getElementById("participantsList");

  // Sort competitors by score (descending)
  competitors.sort((a, b) => b.score - a.score);

  // Populate the list
  competitors.forEach((competitor) => {
    const participant = document.createElement("div");
    participant.className = "participant-item";

    participant.innerHTML = `
                        <div class="participant-info">
                            <div class="avatar">${competitor.avatar}</div>
                            <div>${competitor.name}</div>
                        </div>
                        <div class="participant-score">${competitor.score}%</div>
                    `;

    participantsList.appendChild(participant);
  });

  // To connect to your actual API:
  /*
                fetch('/api/quiz-competitors?id=123')
                    .then(response => response.json())
                    .then(data => {
                        // Clear existing list
                        participantsList.innerHTML = '';
                        
                        // Sort and populate with real data
                        data.sort((a, b) => b.score - a.score)
                           .forEach(competitor => {
                               // Create and append participant items as above
                           });
                    })
                    .catch(error => {
                        console.error('Error fetching competitor results:', error);
                    });
                */
});

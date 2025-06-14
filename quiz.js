     // JavaScript to handle quiz logic
     const questions = [
        {
          questionText: "2+2=?",
          questionType: "single-correct",
          options: ["4", "5", "76", "34"],
          correctAnswer: "A",
        },
        {
          questionText: "2+2=?",
          questionType: "multiple-correct",
          options: ["4", "5", "6", "7"],
          correctAnswer: ["A", "B"],
        },
        {
          questionText: "hgjghghjghj",
          questionType: "true-false",
          options: [],
          correctAnswer: "True",
        },
      ];

      let currentQuestionIndex = 0;

      function loadQuestion(index) {
        const question = questions[index];
        const questionCard = document.querySelector(".question-card");
        questionCard.querySelector("h3").textContent = `Question ${index + 1}`;
        questionCard.querySelector("p").textContent = question.questionText;

        const optionsList = questionCard.querySelector(".options-list");
        optionsList.innerHTML = "";

        if (question.questionType === "single-correct" || question.questionType === "multiple-correct") {
          question.options.forEach((option, i) => {
            const li = document.createElement("li");
            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = question.questionType === "single-correct" ? "radio" : "checkbox";
            input.name = `question${index + 1}`;
            input.value = String.fromCharCode(65 + i); // A, B, C, D
            label.appendChild(input);
            label.appendChild(document.createTextNode(option));
            li.appendChild(label);
            optionsList.appendChild(li);
          });
        } else if (question.questionType === "true-false") {
          const liTrue = document.createElement("li");
          const labelTrue = document.createElement("label");
          const inputTrue = document.createElement("input");
          inputTrue.type = "radio";
          inputTrue.name = `question${index + 1}`;
          inputTrue.value = "True";
          labelTrue.appendChild(inputTrue);
          labelTrue.appendChild(document.createTextNode("True"));
          liTrue.appendChild(labelTrue);
          optionsList.appendChild(liTrue);

          const liFalse = document.createElement("li");
          const labelFalse = document.createElement("label");
          const inputFalse = document.createElement("input");
          inputFalse.type = "radio";
          inputFalse.name = `question${index + 1}`;
          inputFalse.value = "False";
          labelFalse.appendChild(inputFalse);
          labelFalse.appendChild(document.createTextNode("False"));
          liFalse.appendChild(labelFalse);
          optionsList.appendChild(liFalse);
        }
      }

      document.querySelector(".btn-primary").addEventListener("click", () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
          loadQuestion(currentQuestionIndex);
        } else {
          alert("Quiz completed!");
        }
      });

      document.querySelector(".btn-end-test").addEventListener("click", () => {
        alert("Test ended!");
      });

      // Load the first question
      loadQuestion(currentQuestionIndex);
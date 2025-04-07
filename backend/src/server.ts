import { app } from "./app.js";
import { Db } from "./config/database.config.js";
import { caching } from "./app.js";
import { RedisCacheService } from "./types/common.type.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { ITakenQuiz, TakenQuiz } from "./models/takenQuiz.model.js";

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN_LINK || "http://127.0.0.1:5500",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("message", (data) => {
    console.log(`Message received: ${data}`);
    io.emit("message", data);
  });

  socket.on("joinSession", (data) => {
    console.log(`\n\n`, data);
    if (data.sessionId && typeof data.sessionId === "string") {
      const sessionId = data.sessionId;
      io.emit(`newUser-${sessionId}`, data);
    }
  });
  socket.on("newAnswer", async (data) => {
    try {
      const sessionQuiz: ITakenQuiz | null = await TakenQuiz.findOne({
        _id: data.sessionId,
      });
      if (!sessionQuiz) {
        throw new Error("Session not found");
      }
      for (const el of sessionQuiz.competitors) {
        if (el.userId.toString() === data.userId) {
          const indexOfElement: number = sessionQuiz.competitors.indexOf(el);
          if (sessionQuiz.competitors[indexOfElement].answers.length === 0) {
            sessionQuiz.competitors[indexOfElement].answers.push({
              questionId: data.questionId,
              answer: data.answer.join(","),
              correct: false,
            });
          } else {
            let founded: boolean = false;
            let indexOfAnswer;
            for (const ans of sessionQuiz.competitors[indexOfElement].answers) {
              if (ans.questionId.toString() === data.questionId) {
                founded = true;
                indexOfAnswer =
                  sessionQuiz.competitors[indexOfElement].answers.indexOf(ans);
                break;
              }
            }
            if (founded && typeof indexOfAnswer === "number") {
              sessionQuiz.competitors[indexOfElement].answers[indexOfAnswer] = {
                questionId: data.questionId,
                answer: data.answer.join(","),
                correct: false,
              };
            } else {
              sessionQuiz.competitors[indexOfElement].answers.push({
                questionId: data.questionId,
                answer: data.answer.join(","),
                correct: false,
              });
            }
          }
        }
      }
      await sessionQuiz.save();
      io.emit(`newAnswer-${data.sessionId}`, {
        userId: data.userId,
        questionId: data.questionId,
        questionText: data.questionText,
        status: "success",
        answer: data.answer,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error(err);
    }
  });
  socket.on("submitQuiz", (data) => {
    console.log(`submitQuiz-${data.sessionId}`);
    io.emit(`submitQuiz-${data.sessionId}`, { userId: data.userId });
  });

  socket.on("submit_session", async (data) => {
    try {
      const { questionId, answer, questionText, userId, sessionId } = data;
      const sessionQuiz: ITakenQuiz | null = await TakenQuiz.findOne({
        _id: sessionId,
      });
      if (!sessionQuiz) {
        throw new Error("Session not found");
      }
      for (const el of sessionQuiz.competitors) {
        if (el.userId.toString() === userId) {
          el.finished = true;
        }
      }
      // Send to admin
      io.emit("answer_pack", {
        userId,
        questionId,
        questionText,
        status: "success",
        answer,
        timestamp: new Date(),
      });
      console.log(`Sent`);
    } catch (error) {
      console.error("Error saving answer:", error);
      socket.emit("error", { message: "Failed to save answer" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(3000, async () => {
  new Db(process.env.DB_LINK || "");
  await (caching as RedisCacheService).set("key", "value");
  const value = await (caching as RedisCacheService).get("key");
  if (value) {
    console.log(`Caching service is working`);
  }
  console.log(`Server is running on port 3000`);
});

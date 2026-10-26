import { request } from "./client";

export function fetchQuestions({ signal } = {}) {
  return request("/questions", { method: "GET", auth: true, signal });
}

export function submitAnswer(questionId, answer) {
  return request(`/game/questions/${questionId}/answer`, {
    method: "POST",
    auth: true,
    body: { answer },
  });
}

export function fetchGameLeaderboard({ signal } = {}) {
  return request("/game/leaderboard", { method: "GET", signal });
}

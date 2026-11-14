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
  return request("/game/leaderboard", { method: "GET", auth: true, signal });
}

export function fetchGameState({ signal } = {}) {
  return request("/game/state", { method: "GET", signal });
}

export function startGame() {
  return request("/game/start", { method: "POST", auth: true });
}

export function stopGame() {
  return request("/game/stop", { method: "POST", auth: true });
}

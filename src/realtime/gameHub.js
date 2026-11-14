import { createHub } from "./hubConnection";

export const GAME_STATE_CHANGED_EVENT = "GameStateChanged";
export const QUESTION_RELEASED_EVENT = "QuestionReleased";
export const QUESTION_UPDATED_EVENT = "QuestionUpdated";
export const QUESTION_RETRACTED_EVENT = "QuestionRetracted";
export const ANSWER_SUBMITTED_EVENT = "AnswerSubmitted";
export const LEADERBOARD_UPDATED_EVENT = "LeaderboardUpdated";

export const GAME_ADMIN_GROUP_METHOD = "JoinAdminGroup";
export const GAME_PARTICIPANT_GROUP_METHOD = "JoinParticipantGroup";

export function createGameHubConnection() {
  return createHub("/hubs/game", { auth: true });
}

export function joinGameAdminGroup(connection) {
  return connection.invoke(GAME_ADMIN_GROUP_METHOD);
}

export function joinGameParticipantGroup(connection) {
  return connection.invoke(GAME_PARTICIPANT_GROUP_METHOD);
}

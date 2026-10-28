/* ==========================================================================
   Judging endpoints
   --------------------------------------------------------------------------
   GET  /judging/criteria?challengeId={challengeId}
        Authenticated. Returns the criteria catalogue for one challenge,
        including each criterion's reference questions.

   POST /judging/scores
        { teamId, scores: [{ criterionId, criterionQuestionId, name,
                             maxScore, score, skipped, comment }] }
        Catalogue-question scores always carry the criterion id *and* the
        matching criterionQuestionId; ad-hoc questions use a null
        criterionQuestionId plus a name and maxScore.

   POST /judging/criteria/{criterionId}/publish
   POST /judging/criteria/{criterionId}/unpublish
        Publication is per judge. Both calls are idempotent and affect only
        the caller's saved scores.

   `judgeId` is deliberately never sent: the backend derives the judge from
   the Bearer token.
   ========================================================================== */

import { ApiError, request } from "./client";

function positiveInteger(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

/**
 * Criteria are always challenge-scoped. Refusing to call the endpoint without
 * a valid challenge id prevents an unscoped response being presented as if it
 * belonged to the selected team.
 */
export function fetchAllJudgingCriteria({ signal } = {}) {
  return request("/judging/criteria", {
    method: "GET",
    auth: true,
    signal,
  });
}

export function fetchJudgingCriteria({ challengeId, signal } = {}) {
  const numericChallengeId = positiveInteger(challengeId);

  if (numericChallengeId === null) {
    return Promise.reject(
      new ApiError("A valid challenge is required to load judging criteria.", {
        status: 400,
        code: "challenge.invalid",
      }),
    );
  }

  return request(
    `/judging/criteria?challengeId=${encodeURIComponent(numericChallengeId)}`,
    {
      method: "GET",
      auth: true,
      signal,
    },
  );
}

export function submitScores({ teamId, scores }) {
  return request("/judging/scores", {
    method: "POST",
    auth: true,
    body: { teamId, scores },
  });
}

export function publishCriterion(criterionId) {
  const numericCriterionId = positiveInteger(criterionId);

  if (numericCriterionId === null) {
    return Promise.reject(
      new ApiError("A valid criterion is required to publish scores.", {
        status: 400,
        code: "criterion.invalid",
      }),
    );
  }

  return request(
    `/judging/criteria/${encodeURIComponent(numericCriterionId)}/publish`,
    {
      method: "POST",
      auth: true,
    },
  );
}

export function unpublishCriterion(criterionId) {
  const numericCriterionId = positiveInteger(criterionId);

  if (numericCriterionId === null) {
    return Promise.reject(
      new ApiError("A valid criterion is required to unpublish scores.", {
        status: 400,
        code: "criterion.invalid",
      }),
    );
  }

  return request(
    `/judging/criteria/${encodeURIComponent(numericCriterionId)}/unpublish`,
    {
      method: "POST",
      auth: true,
    },
  );
}

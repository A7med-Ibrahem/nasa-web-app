/* ==========================================================================
   Judging endpoints
   --------------------------------------------------------------------------
   GET  /judging/criteria?teamId={teamId}
        Authenticated. Returns the five global criteria with publication state
        scoped to the caller's judge profile and the requested team. Each
        criterion is scored once per team, from 1.0 to its max score. Questions
        are reference prompts only and are never scored.

   POST /judging/scores/{criterionId}
        { teamId, score, comment? }
        Saves and publishes the caller's score for one criterion and team.
        Re-submitting replaces the previous score and republishes it.

   POST /judging/criteria/{criterionId}/publish?teamId={teamId}
   POST /judging/criteria/{criterionId}/unpublish?teamId={teamId}
        Publication is per judge, team and criterion. Both calls are idempotent
        and affect only the caller's saved score for that team.

   `judgeId` is deliberately never sent: the backend derives the judge from
   the Bearer token.
   ========================================================================== */

import { ApiError, request } from "./client";

function positiveInteger(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function withQuery(path, params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (hasValue(value)) {
      query.set(key, String(value));
    }
  });

  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export function fetchJudgingCriteria({ teamId, signal } = {}) {
  const numericTeamId = positiveInteger(teamId);

  if (hasValue(teamId) && numericTeamId === null) {
    return Promise.reject(
      new ApiError("A valid team is required to load judging criteria.", {
        status: 400,
        code: "team.invalid",
      }),
    );
  }

  return request(withQuery("/judging/criteria", { teamId: numericTeamId }), {
    method: "GET",
    auth: true,
    signal,
  });
}

export function submitScores({ teamId, scores }) {
  return request("/judging/scores", {
    method: "POST",
    auth: true,
    body: { teamId, scores },
  });
}

export function submitCriterionScore({
  criterionId,
  teamId,
  score,
  comment,
} = {}) {
  const numericCriterionId = positiveInteger(criterionId);
  const numericTeamId = positiveInteger(teamId);

  if (numericCriterionId === null) {
    return Promise.reject(
      new ApiError("A valid criterion is required to submit a score.", {
        status: 400,
        code: "criterion.invalid",
      }),
    );
  }

  if (numericTeamId === null) {
    return Promise.reject(
      new ApiError("A valid team is required to submit a score.", {
        status: 400,
        code: "team.invalid",
      }),
    );
  }

  if (!hasValue(score) || !Number.isFinite(Number(score))) {
    return Promise.reject(
      new ApiError("A valid score is required to submit a score.", {
        status: 400,
        code: "score.invalid",
      }),
    );
  }

  const trimmedComment =
    typeof comment === "string" ? comment.trim() : "";

  return request(
    `/judging/scores/${encodeURIComponent(numericCriterionId)}`,
    {
      method: "POST",
      auth: true,
      body: {
        teamId: numericTeamId,
        score: Number(score),
        ...(trimmedComment ? { comment: trimmedComment } : {}),
      },
    },
  );
}

function requirePublicationTarget(criterionId, teamId, action) {
  const numericCriterionId = positiveInteger(criterionId);
  const numericTeamId = positiveInteger(teamId);

  if (numericCriterionId === null) {
    return {
      error: new ApiError(
        `A valid criterion is required to ${action} scores.`,
        { status: 400, code: "criterion.invalid" },
      ),
    };
  }

  if (numericTeamId === null) {
    return {
      error: new ApiError(`A valid team is required to ${action} scores.`, {
        status: 400,
        code: "team.invalid",
      }),
    };
  }

  return {
    path: withQuery(
      `/judging/criteria/${encodeURIComponent(numericCriterionId)}/${action}`,
      { teamId: numericTeamId },
    ),
  };
}

export function publishCriterion(criterionId, { teamId } = {}) {
  const target = requirePublicationTarget(criterionId, teamId, "publish");

  if (target.error) {
    return Promise.reject(target.error);
  }

  return request(target.path, {
    method: "POST",
    auth: true,
  });
}

export function unpublishCriterion(criterionId, { teamId } = {}) {
  const target = requirePublicationTarget(criterionId, teamId, "unpublish");

  if (target.error) {
    return Promise.reject(target.error);
  }

  return request(target.path, {
    method: "POST",
    auth: true,
  });
}

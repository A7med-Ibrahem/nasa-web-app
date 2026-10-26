/* ==========================================================================
   Judge Dashboard + evaluation screen content
   --------------------------------------------------------------------------
   Copy for `/judge` and `/judge/teams/:teamId/evaluate`. Every label,
   placeholder and state message lives here so the components stay
   markup-only, matching the other data modules in this folder.

   BRANDING: this project is NASA Space Apps **Hurghada**. Nothing here may
   name a different Egyptian city, and no judge, team, avatar or identity is
   hardcoded — those values always come from the signed-in session or the API.

   All data the dashboard *renders* (teams, members, challenges, criteria)
   comes from the backend; only the wording below is static.
   ========================================================================== */

export const judgeDashboard = {
  hero: {
    eyebrow: "Judge Portal",
    title: "Judge Dashboard",
    description:
      "Search teams, review their details and score their solutions against the official NASA Space Apps Hurghada judging criteria.",
    roleBadge: "Judge",
    sessionLabel: "Signed in",
  },

  search: {
    title: "Search Teams",
    label: "Team name or username",
    placeholder: "Search by team name or username",
    submit: "Search",
    hint: "Press Enter or select a team from the results to open its details.",
    resultLabel: (count) =>
      count === 1 ? "1 team found" : `${count} teams found`,
    loading: "Searching teams…",
    initialLoading: "Loading teams…",
    emptyTitle: "No teams found",
    emptyText: "No team matches that search. Try a different name or username.",
    errorTitle: "Could not load teams",
    retry: "Try again",
    showAll: "Show all teams",
  },

  table: {
    caption: "Teams returned by the team search endpoint",
    columns: {
      index: "#",
      team: "Team",
      teamId: "Team ID",
      username: "Username",
      status: "Status",
      action: "Action",
    },
    view: "View",
    viewLabel: (name) => `View team ${name}`,
    fallbackName: "Unnamed team",
    fallbackUsername: "Not provided",
    selectedRow: "Selected team",
  },

  details: {
    title: "Team Details",
    selectPromptTitle: "Select a team",
    selectPromptText:
      "Choose a team from the list to see its members, challenge and judging action.",
    loading: "Loading team details…",
    errorTitle: "Could not load this team",
    teamIdLabel: "Team ID",
    usernameLabel: "Username",
    statusLabel: "Status",
    challengeLabel: "Challenge",
    challengeLoading: "Loading challenge…",
    challengeUnavailable: "Challenge details are unavailable right now.",
    projectTitle: "Project",
    projectRepository: "Repository",
    projectDemo: "Live demo",
    projectLinkHint: "opens in a new tab",
    membersTitle: "Members",
    membersCount: (count) => (count === 1 ? "1 member" : `${count} members`),
    membersLoading: "Loading members…",
    membersEmpty: "No members were returned for this team.",
    membersError: "Members could not be loaded.",
    memberFallback: "Team member",
    startJudging: "Start Judging",
    startJudgingHint: "Score this team against the official criteria.",
    avatarFallback: "Team",
  },
};

export const judgeEvaluation = {
  backLabel: "Back to dashboard",
  eyebrow: "Judge Portal",
  title: "Evaluate Team",
  description:
    "Score each reference question within its criterion's maximum. Comments are optional and are saved with your score.",
  teamLabel: "Team",
  teamIdLabel: "Team ID",
  criteriaTitle: "Judging Criteria",
  criteriaLoading: "Loading judging criteria…",
  criteriaErrorTitle: "Could not load the judging criteria",
  criteriaChallengeTitle: "Cannot determine this team's challenge",
  criteriaChallengeText:
    "The team details do not include a usable challenge, so judging criteria cannot be loaded safely.",
  criteriaTeamTitle: "Could not load this team",
  criteriaTeamText:
    "The team details could not be loaded, so judging criteria cannot be matched safely.",
  criteriaScopeTitle: "Judging criteria do not match this challenge",
  criteriaScopeText:
    "The server returned criteria that are not linked to this team's challenge. Scoring is disabled to avoid submitting scores for the wrong challenge.",
  criteriaMalformedTitle: "Judging criteria are incomplete",
  criteriaMalformedText:
    "The server returned criteria without the fields required for safe scoring.",
  criteriaEmpty: "No judging criteria are available for this team's challenge.",
  criteriaNoQuestions:
    "The criteria for this challenge do not contain any active questions to score.",
  criterionNoQuestions: "No active questions are available for this criterion.",
  scoreLabel: (maxScore) => `Score (0 – ${maxScore})`,
  scorePlaceholder: "0",
  weightLabel: (weight) => `Weight ×${weight}`,
  commentLabel: "Comment",
  commentPlaceholder: "Optional comment",
  skipLabel: "Skip this question for my scoring",
  skippedBadge: "Skipped",
  submit: "Submit Scores",
  submitting: "Submitting…",
  requiredError: "Enter a score for this question or mark it as skipped.",
  rangeError: (maxScore) => `Score must be between 0 and ${maxScore}.`,
  numberError: "Scores must be numbers.",
  successTitle: "Scores saved",
  successText: (count) =>
    `${count} ${count === 1 ? "score was" : "scores were"} accepted by the server.`,
  teamMismatchError:
    "The selected team is still loading or has changed. Wait for it to finish loading and try again.",
  noScoresError: "There are no question scores to submit.",
  unexpectedResponseError:
    "The server did not return the saved scores. Reload the page to confirm before publishing.",
  errorTitle: "Submission failed",
  backToTeam: "Back to team",
  publishedBadge: "Published by you",
  notPublishedBadge: "Not published by you",
  publicationUnknownBadge: "Publication status unavailable",
  publishedJudgeCount: (count) =>
    count === 1 ? "1 judge published" : `${count} judges published`,
  saveBeforePublish: "Save your scores to publish this criterion.",
  publishHint: "Saving scores does not publish them.",
  publishAction: "Publish my scores",
  publishing: "Publishing…",
  unpublishAction: "Unpublish my scores",
  unpublishing: "Unpublishing…",
  publishSuccess: "Your scores for this criterion are now published.",
  unpublishSuccess: "Your scores for this criterion are no longer published.",
  publishErrorTitle: "Could not update publication",
  publicationUnknownNote:
    "The server did not report your publication status for this criterion.",
  errors: {
    "team.not_found": "This team no longer exists.",
    "criterion.not_found":
      "This criterion no longer exists. Reload the page and try again.",
    "criterion_question.not_found":
      "One of the questions no longer exists. Reload the page and try again.",
    "score.invalid":
      "One or more scores are invalid. Check the values and try again.",
    "judging.no_scores":
      "There are no saved scores to publish for this criterion.",
    "judging.no_judge_link":
      "Your account is not linked to a judge profile, so scoring is not allowed.",
    "judging.not_allowed":
      "You are not allowed to perform this judging action.",
  },
};

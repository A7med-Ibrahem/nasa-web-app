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
    "Score each criterion once from 1.0 to its maximum. Submitting a criterion saves your score and publishes it for this team, so the live standings update immediately. Reference prompts are guidance only and are never scored. Comments are optional.",
  teamLabel: "Team",
  teamIdLabel: "Team ID",
  criteriaTitle: "Judging Criteria",
  criteriaLoading: "Loading judging criteria…",
  criteriaErrorTitle: "Could not load the judging criteria",
  criteriaTeamIdTitle: "Invalid team link",
  criteriaTeamIdText:
    "This page needs a valid team ID. Return to the dashboard and choose a team.",
  criteriaTeamTitle: "Could not load this team",
  criteriaTeamText:
    "The team details could not be loaded, so scoring is unavailable.",
  criteriaMalformedTitle: "Judging criteria are incomplete",
  criteriaMalformedText:
    "The server returned criteria without the fields required for safe scoring.",
  criteriaEmpty: "No judging criteria are available yet.",
  challengeReferenceTitle: "Challenge Reference Q&A",
  challengeReferenceDescription:
    "Background questions and answers for this team's challenge. For judge context only; they are never scored.",
  challengeReferenceLoading: "Loading challenge reference Q&A...",
  challengeReferenceEmpty:
    "No reference Q&A has been added for this challenge.",
  challengeReferenceError: "Challenge reference Q&A could not be loaded.",
  challengeReferenceAnswerLabel: "Answer",
  referencePromptsLabel: "Reference prompts",
  scoreLabel: (maxScore) => `Score (1.0 – ${maxScore})`,
  scorePlaceholder: "1.0",
  weightLabel: (weight) => `Weight ×${weight}`,
  commentLabel: "Comment",
  commentPlaceholder: "Optional comment",
  submitCriterion: "Submit & publish",
  resubmitCriterion: "Update & republish",
  submittingCriterion: "Submitting & publishing…",
  resubmittingCriterion: "Updating & republishing…",
  requiredError: "Enter a score for this criterion.",
  rangeError: (maxScore) => `Score must be between 1 and ${maxScore}.`,
  numberError: "Scores must be numbers.",
  submitSuccess:
    "Your score is saved and published. The live standings have been updated.",
  teamMismatchError:
    "The selected team is still loading or has changed. Wait for it to finish loading and try again.",
  unexpectedResponseError:
    "The server did not return the updated criterion. Reload the page to confirm.",
  criterionErrorTitle: "Could not submit this criterion",
  backToTeam: "Back to team",
  publishedBadge: "Published by you",
  notPublishedBadge: "Not published by you",
  publicationUnknownBadge: "Publication status unavailable",
  publishedJudgeCount: (count) =>
    count === 1 ? "1 judge published" : `${count} judges published`,
  publishHint: "Submitting saves your score and publishes it for this team.",
  unpublishAction: "Unpublish my score",
  unpublishing: "Unpublishing…",
  unpublishSuccess:
    "Your score for this criterion is no longer published for this team.",
  publishErrorTitle: "Could not update publication",
  publicationUnknownNote:
    "The server did not report your publication status for this criterion.",
  errors: {
    "team.not_found": "This team no longer exists.",
    "criterion.not_found":
      "This criterion no longer exists. Reload the page and try again.",
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

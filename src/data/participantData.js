/* ==========================================================================
   Participant area copy
   --------------------------------------------------------------------------
   All UI copy for participant login/dashboard/game/requests lives here.
   No fixtures, copy only.
   ========================================================================== */

export const participantData = {
  roles: {
    participant: "Participant",
  },
  navbar: {
    myTeam: "My Team",
  },
  login: {
    segment: {
      staff: "Organizer / Judge",
      participant: "Participant Team",
    },
    participantCard: {
      title: "Participant Team",
      subtitle: "Sign in with your team credentials",
    },
    participantForm: {
      usernameLabel: "Team Username",
      usernamePlaceholder: "e.g. orion",
      usernameError: "Enter your team username.",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      passwordError: "Enter your password.",
      rememberMe: "Remember me",
      showPassword: "Show password",
      hidePassword: "Hide password",
      submit: "Sign In",
      submitting: "Signing in…",
      invalidCredentials: "Invalid username or password.",
      networkError:
        "Could not reach the server. Check your connection and try again.",
      genericError: "Sign-in failed. Please try again.",
    },
  },
  layout: {
    tabs: {
      dashboard: "Dashboard",
      game: "Game",
      requests: "Requests",
    },
  },
  dashboard: {
    title: "My Team",
    loadingTeam: "Loading team…",
    retry: "Retry",
    errorTitle: "Could not load team",
    noChallenge: "No challenge assigned yet",
    noProject: "No project details available yet",
    noMembers: "No team members listed",
    links: {
      game: "Go to Game",
      requests: "Go to Requests",
    },
    sections: {
      challenge: "Challenge",
      project: "Project",
      members: "Team Members",
      quickLinks: "Quick Links",
    },
    project: {
      repository: "Repository",
      demo: "Demo",
    },
  },
  game: {
    title: "Game",
    subtitle: "Answer questions for your team",
    loading: "Loading questions…",
    errorTitle: "Could not load questions",
    retry: "Retry",
    refresh: "Refresh",
    empty: "No questions are open right now",
    focusRefresh: "Refetching on focus",
    standing: {
      title: "Your Team Standing",
      rank: "Rank",
      correct: "Correct",
      points: "Points",
      tie: "Tied",
      notListed: "No points yet",
    },
    leaderboardTop: "Top 5",
    question: {
      points: "Points",
      submit: "Submit Answer",
      submitting: "Submitting…",
      alreadyAnswered: "Your team already answered this question",
      correct: "Correct",
      incorrect: "Incorrect",
      submittedAt: "Submitted at",
      cannotDisplay: "This question can't be displayed",
      answerEmpty: "Enter an answer.",
      optionPlaceholder: "Select an option",
      textPlaceholder: "Type your answer",
    },
    errors: {
      answer: {
        already_submitted: "Your team already answered this question.",
        empty: "Enter an answer.",
        question_not_found: "This question is no longer available.",
      },
    },
  },
  requests: {
    title: "Requests",
    subtitle: "Ask the organizers for help",
    createTitle: "Create Request",
    typeLabel: "Type",
    messageLabel: "Message",
    messagePlaceholder: "Describe your request...",
    messageError: "Enter a message.",
    messageLengthNote: "Keep it concise.",
    submit: "Submit Request",
    submitting: "Submitting…",
    listTitle: "Your Requests",
    loading: "Loading requests…",
    errorTitle: "Could not load requests",
    retry: "Retry",
    refresh: "Refresh",
    empty: "No requests yet",
    status: {
      pending: "Pending",
      inProgress: "In Progress",
      resolved: "Resolved",
      rejected: "Rejected",
    },
    createdAt: "Created",
    resolvedAt: "Resolved/Rejected",
    delete: "Delete",
    deleting: "Deleting…",
    deleteConfirm: "Delete this request?",
    onlyPending: "Only pending requests can be deleted.",
    types: ["Mentor", "Technical", "Logistics", "Hardware", "Other"],
    realtime: {
      indicatorAuto: "Auto-refreshing",
      indicatorLive: "Live",
      indicatorOffline: "Offline",
    },
    errors: {
      request: {
        invalid: "The request is not valid.",
        forbidden: "You are not allowed to perform this action.",
        not_found: "Request not found.",
      },
    },
  },
};

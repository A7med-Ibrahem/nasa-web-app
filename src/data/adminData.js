/* ==========================================================================
   Admin area copy
   --------------------------------------------------------------------------
   Every string rendered by /admin lives here. Staff, sponsors and tiers are
   always API responses; this module contains no fixtures.
   ========================================================================== */

function publishScope(judgeLabel) {
  return judgeLabel ? `for ${judgeLabel}` : "for all judges who have scored";
}

export const adminData = {
  common: {
    loading: "Loading…",
    retry: "Retry",
    refresh: "Refresh",
    dash: "—",
    cancel: "Cancel",
    close: "Close",
    required: "Required",
    forbidden: "You do not have permission to perform this action.",
    unauthorized: "Your session is no longer valid. Please sign in again.",
    network: "Could not reach the server. Check your connection and try again.",
    genericError: "The request could not be completed.",
    saved: "Saved.",
    deleted: "Deleted.",
    working: "Working…",
    challenge: "Challenge",
    allChallenges: "All challenges",
    yes: "Yes",
    no: "No",
    image: {
      choose: "Choose image",
      replace: "Replace image",
      remove: "Remove",
      noImage: "No image selected.",
      hint: "PNG, JPEG, WebP, GIF or SVG. Raster images are resized to 512 px before saving.",
      processing: "Processing image…",
      tooLarge: "The image must be 20 MB or smaller.",
      svgTooLarge: "SVG images must be 200 KB or smaller.",
      gifTooLarge: "GIF images must be 1 MB or smaller.",
      invalidType: "Choose a PNG, JPEG, WebP, GIF or SVG image.",
      unreadable: "The image could not be read.",
      resized: (width, height, kilobytes) =>
        `Resized to ${width}×${height} px (${kilobytes} KB).`,
      ready: "Image ready.",
    },
  },
  layout: {
    eyebrow: "Administration",
    title: "Admin Area",
    /* Add a tab here when its page and route exist; the markup reads this
       config, so no layout edit is needed. */
    tabs: [
      { id: "overview", label: "Overview", to: "/admin" },
      { id: "staff", label: "Staff", to: "/admin/staff" },
      { id: "sponsors", label: "Sponsors & Tiers", to: "/admin/sponsors" },
      { id: "criteria", label: "Criteria", to: "/admin/criteria" },
      {
        id: "publishing",
        label: "Publishing",
        to: "/admin/criteria/publish",
      },
      { id: "questions", label: "Questions", to: "/admin/questions" },
      { id: "season-media", label: "Season media", to: "/admin/season-media" },
      { id: "challenges", label: "Challenges", to: "/admin/challenges" },
      { id: "teams", label: "Teams", to: "/admin/teams" },
    ],
  },
  overview: {
    eyebrow: "Overview",
    title: "Admin overview",
    description: "Live counts across the platform. Numbers come from the API responses.",
    refresh: "Refresh",
    lastUpdated: (time) => `Last updated: ${time}`,
    cards: {
      staff: { title: "Staff", link: "/admin/staff" },
      sponsors: { title: "Sponsors & Tiers", link: "/admin/sponsors" },
      teams: { title: "Teams", link: "/admin/teams" },
      challenges: { title: "Challenges", link: "/admin/challenges" },
      criteria: { title: "Criteria", link: "/admin/criteria" },
      questions: { title: "Questions", link: "/admin/questions" },
      requests: { title: "Requests", link: "/staff/requests" },
      seasonMedia: { title: "Season media", link: "/admin/season-media" },
      standings: { title: "Standings", link: "/live-standings" },
    },
    states: {
      loading: "Loading overview…",
      errorTitle: "Could not load overview",
      empty: "No data available.",
    },
    staff: {
      total: (count) => `Total: ${count}`,
      byRole: (role, count) => `${role}: ${count}`,
      inactive: (count) => `Inactive: ${count}`,
    },
    sponsors: {
      active: (count) => `Active: ${count}`,
      inactive: (count) => `Inactive: ${count}`,
      tiers: (count) => `Tiers: ${count}`,
    },
    teams: {
      total: (count) => `Total: ${count}`,
      active: (count) => `Active: ${count}`,
    },
    challenges: {
      total: (count) => `Total: ${count}`,
    },
    criteria: {
      total: (count) => `Total: ${count}`,
      published: (count) => `Published: ${count}`,
      global: (count) => `Global: ${count}`,
    },
    questions: {
      total: (count) => `Total: ${count}`,
      published: (count) => `Published: ${count}`,
    },
    requests: {
      total: (count) => `Total: ${count}`,
    },
    seasonMedia: {
      active: (count) => `Active: ${count}`,
      inactive: (count) => `Inactive: ${count}`,
    },
    standings: {
      topThree: "Top 3",
      noData: "No standings available.",
      rank: (rank) => `#${rank}`,
      percent: (value) => `${value}%`,
    },
  },
  seasonMedia: {
    eyebrow: "Media",
    title: "Season media",
    description: "Manage season media items shown on the public page.",
    add: "Add media",
    includeInactive: "Include inactive",
    table: {
      caption: "Season media returned by the server",
      image: "Image",
      title: "Title",
      season: "Season",
      mediaType: "Type",
      link: "Link",
      displayOrder: "Order",
      active: "Status",
      actions: "Actions",
    },
    activeLabel: "Active",
    inactiveLabel: "Inactive",
    actions: {
      edit: "Edit",
      delete: "Delete",
      changeImage: "Change image",
      removeImage: "Remove image",
      working: "Working…",
    },
    states: {
      loading: "Loading season media…",
      errorTitle: "Could not load season media",
      empty: "No season media found.",
    },
    form: {
      createTitle: "Add season media",
      editTitle: "Edit season media",
      description: "Season and title are required.",
      season: "Season",
      title: "Title",
      descriptionLabel: "Description",
      image: "Image",
      link: "Link",
      linkHint: "Optional. Must start with http:// or https://.",
      mediaType: "Media type",
      mediaTypeOptions: [
        { value: "image", label: "image" },
        { value: "video", label: "video" },
        { value: "other", label: "other" },
      ],
      displayOrder: "Display order",
      displayOrderHint: "Integer. Lower values appear first.",
      active: "Active",
      submitCreate: "Create",
      submitEdit: "Save changes",
      saving: "Saving…",
      hint: "Fields marked with an asterisk are required.",
      validation: {
        seasonRequired: "Enter a season.",
        titleRequired: "Enter a title.",
        linkInvalid: "Enter a full http:// or https:// link, or leave the link blank.",
        orderInvalid: "Enter a whole number, or leave the order blank.",
      },
    },
    confirm: {
      deleteTitle: "Delete this media item?",
      deleteMessage: (title) => `Delete ${title || "this media item"} permanently? This cannot be undone.`,
      confirmDelete: "Delete",
    },
    notice: {
      created: (title) => `${title || "Media"} was created.`,
      updated: (title) => `${title || "Media"} was updated.`,
      deleted: (title) => `${title || "Media"} was deleted.`,
    },
    errors: {
      season_media_invalid: "Some media details are not valid. Check the form.",
      season_media_not_found: "This media item no longer exists. Refresh the list.",
      image_invalid_type: "That image type is not allowed.",
      image_invalid_base64: "The image could not be read.",
      image_too_large: "The image is larger than the server allows.",
      generic: "The change could not be saved.",
      deleteGeneric: "The record could not be deleted.",
    },
  },
  challenges: {
    eyebrow: "Challenges",
    title: "Challenges",
    description: "Read-only list. Titles and descriptions can't be edited from the API yet.",
    note: "Titles and descriptions can't be edited from the API yet.",
    table: {
      caption: "Challenges returned by the server",
      image: "Image",
      title: "Title",
      season: "Season",
      source: "Source",
      actions: "Actions",
    },
    actions: {
      changeImage: "Change image",
      removeImage: "Remove image",
    },
    states: {
      loading: "Loading challenges…",
      errorTitle: "Could not load challenges",
      empty: "No challenges found.",
    },
    imageDialog: {
      title: "Change challenge image",
      description: "Update or remove the challenge image.",
      imageLabel: "Image",
      submit: "Save",
      remove: "Remove image",
      saving: "Saving…",
    },
    errors: {
      image_invalid_type: "That image type is not allowed.",
      image_invalid_base64: "The image could not be read.",
      image_too_large: "The image is larger than the server allows.",
      generic: "The change could not be saved.",
    },
    notice: {
      updated: "Challenge image was updated.",
      removed: "Challenge image was removed.",
    },
  },
  teams: {
    eyebrow: "Teams",
    title: "Teams",
    description: "Debounced server search. Teams can't be created or edited from the API yet. Admin only sees username here.",
    note: "Teams can't be created or edited from the API yet.",
    search: {
      label: "Search",
      placeholder: "Search teams",
      hint: "Search runs on the server after a short pause.",
    },
    table: {
      caption: "Teams returned by the server",
      logo: "Logo",
      name: "Name",
      username: "Username",
      status: "Status",
      actions: "Actions",
    },
    actions: {
      changeLogo: "Change logo",
      removeLogo: "Remove logo",
    },
    states: {
      loading: "Loading teams…",
      errorTitle: "Could not load teams",
      empty: "No teams found.",
    },
    logoDialog: {
      title: "Change team logo",
      description: "Update or remove the team logo.",
      imageLabel: "Logo",
      submit: "Save",
      remove: "Remove logo",
      saving: "Saving…",
    },
    errors: {
      image_invalid_type: "That image type is not allowed.",
      image_invalid_base64: "The image could not be read.",
      image_too_large: "The image is larger than the server allows.",
      generic: "The change could not be saved.",
    },
    notice: {
      updated: "Team logo was updated.",
      removed: "Team logo was removed.",
    },
  },
  staff: {
    eyebrow: "People",
    title: "Staff management",
    description:
      "Create organizer, core team and judge accounts, keep their details current and control who can sign in.",
    add: "Add staff",
    filters: {
      caption: "Filter staff",
      role: "Role",
      allRoles: "All roles",
      memberType: "Member type",
      allMemberTypes: "All member types",
      search: "Search",
      searchPlaceholder: "Name, username or email",
      searchHint: "Search runs on the server after a short pause.",
    },
    roles: ["Admin", "CoreTeam", "Judge"],
    roleLabels: {
      Admin: "Admin",
      CoreTeam: "Core Team",
      Judge: "Judge",
    },
    statuses: ["Active", "Inactive"],
    table: {
      caption: "Staff accounts returned by the server",
      avatar: "Avatar",
      name: "Full name",
      username: "Username",
      email: "Email",
      role: "Role",
      memberType: "Member type",
      status: "Status",
      createdAt: "Created",
      actions: "Actions",
    },
    actions: {
      edit: "Edit",
      deactivate: "Deactivate",
      activate: "Activate",
      delete: "Delete",
      working: "Working…",
    },
    states: {
      loading: "Loading staff…",
      errorTitle: "Could not load staff",
      empty: "No staff match these filters.",
      emptyAll: "No staff accounts were returned.",
      memberTypesLoading: "Loading member types…",
      memberTypesError: "Could not load member types.",
      memberTypesEmpty: "The server returned no member types.",
    },
    sessionNote:
      "Deactivating an account does not revoke tokens already issued: existing sessions stay valid until they expire.",
    self: {
      badge: "You",
      deleteHint: "You cannot delete your own account from the admin area.",
      deactivateHint:
        "You cannot deactivate your own account from the admin area.",
      roleHint:
        "You cannot change the role or status of your own account from the admin area.",
      editHint:
        "Your own role and status are locked here to prevent losing access.",
    },
    form: {
      createTitle: "Add staff account",
      editTitle: "Edit staff account",
      description:
        "All fields are sent as plain JSON. The image is processed in this browser before it is sent.",
      fullName: "Full name",
      username: "Username",
      email: "Email address",
      password: "Password",
      passwordCreateHint: "At least 6 characters.",
      passwordEditHint: "Leave blank to keep the current password.",
      role: "Role",
      memberType: "Member type",
      memberTypeHint: "Required for a Core Team account.",
      status: "Status",
      photo: "Photo",
      submitCreate: "Create account",
      submitEdit: "Save changes",
      saving: "Saving…",
      hint: "Fields marked with an asterisk are required.",
    },
    confirm: {
      deactivateTitle: "Deactivate this account?",
      deactivateMessage: (name) =>
        `${name || "This account"} will no longer be able to sign in. Existing sessions stay valid until they expire.`,
      activateTitle: "Activate this account?",
      activateMessage: (name) =>
        `${name || "This account"} will be able to sign in again.`,
      deleteTitle: "Delete this staff account?",
      deleteMessage: (name) =>
        `Delete ${name || "this account"} permanently? This cannot be undone.`,
      confirmDeactivate: "Deactivate",
      confirmActivate: "Activate",
      confirmDelete: "Delete account",
    },
    notice: {
      created: (name) => `${name || "Staff account"} was created.`,
      updated: (name) => `${name || "Staff account"} was updated.`,
      activated: (name) => `${name || "Staff account"} was activated.`,
      deactivated: (name) => `${name || "Staff account"} was deactivated.`,
      deleted: (name) => `${name || "Staff account"} was deleted.`,
    },
    errors: {
      staff_not_found: "This staff member no longer exists. Refresh the list.",
      staff_invalid: "Some account details are not valid. Check the form.",
      staff_invalid_role: "Choose Admin, Core Team or Judge.",
      staff_weak_password: "The password must be at least 6 characters.",
      staff_username_taken: "That username is already in use.",
      staff_email_taken: "That email address is already in use.",
      staff_member_type_required:
        "Choose a member type for a Core Team account.",
      staff_invalid_member_type: "That member type is not accepted.",
      image_invalid_type: "That image type is not allowed.",
      image_invalid_base64: "The image could not be read.",
      image_too_large: "The image is larger than the server allows.",
      generic: "The account could not be saved.",
      deleteGeneric: "The account could not be deleted.",
    },
  },
  sponsors: {
    eyebrow: "Partners",
    title: "Sponsors & tiers",
    description:
      "Maintain the sponsor wall and the tiers that order it. Sponsor reads also power the public sponsors page.",
    sponsorsTitle: "Sponsors",
    tiersTitle: "Tiers",
    addSponsor: "Add sponsor",
    addTier: "Add tier",
    includeInactive: "Include inactive sponsors",
    includeInactiveHint:
      "The admin always loads inactive records so they can be edited.",
    activeLabel: "Active",
    inactiveLabel: "Inactive",
    tierFilter: "Tier",
    allTiers: "All tiers",
    noTiersHint:
      "Create a tier first: every sponsor needs a tier.",
    noTiersActionHint:
      "Add a tier below before creating a sponsor.",
    table: {
      caption: "Sponsors returned by the server",
      logo: "Logo",
      name: "Name",
      link: "Link",
      tier: "Tier",
      active: "Active",
      displayOrder: "Order",
      actions: "Actions",
      tierCaption: "Sponsor tiers returned by the server",
      tierName: "Tier",
      priority: "Priority",
      banner: "Banner",
      sponsorCount: "Sponsors",
      tierActions: "Actions",
    },
    actions: {
      edit: "Edit",
      delete: "Delete",
      working: "Working…",
    },
    states: {
      sponsorsLoading: "Loading sponsors…",
      sponsorsError: "Could not load sponsors",
      sponsorsEmpty: "No sponsors match these filters.",
      sponsorsEmptyAll: "No sponsors were returned by the server.",
      tiersLoading: "Loading tiers…",
      tiersError: "Could not load tiers",
      tiersEmpty: "No tiers yet. Add the first tier below.",
    },
    form: {
      sponsorCreateTitle: "Add sponsor",
      sponsorEditTitle: "Edit sponsor",
      sponsorDescription:
        "The logo is resized in this browser. The saved list is reloaded after every save.",
      tierCreateTitle: "Add tier",
      tierEditTitle: "Edit tier",
      tierDescription:
        "Priority orders the public sponsor wall from lowest to highest.",
      name: "Name",
      logo: "Logo",
      link: "Link",
      linkHint: "Optional. Must start with http:// or https://.",
      tier: "Tier",
      tierHint: "Required. Create a tier first if the list is empty.",
      active: "Active",
      activeHint: "Inactive sponsors stay hidden on the public page.",
      displayOrder: "Display order",
      displayOrderHint: "Optional whole number; lower values appear first.",
      priority: "Priority",
      priorityHint: "Whole number; lower values appear first.",
      bannerEnabled: "Banner enabled",
      bannerEnabledHint:
        "Allow this tier to appear in the banner treatment on the public site.",
      submitCreate: "Create",
      submitEdit: "Save changes",
      saving: "Saving…",
      required: "Fields marked with an asterisk are required.",
      sponsorNoTiers:
        "No tiers are available yet. Create a tier before adding sponsors.",
      validation: {
        nameRequired: "Enter a name.",
        linkInvalid:
          "Enter a full http:// or https:// link, or leave the link blank.",
        tierRequired: "Choose a tier.",
        orderInvalid:
          "Enter a whole number of 0 or more, or leave the order blank.",
        tierNameRequired: "Enter a tier name.",
        priorityInvalid: "Enter a whole number of 0 or more.",
      },
    },
    confirm: {
      deleteSponsorTitle: "Delete this sponsor?",
      deleteSponsorMessage: (name) =>
        `Delete ${name || "this sponsor"} permanently? This cannot be undone.`,
      deleteTierTitle: "Delete this tier?",
      deleteTierMessage: (name) =>
        `Delete ${name || "this tier"}? Sponsors that still use it may be affected. This cannot be undone.`,
      confirmSponsor: "Delete sponsor",
      confirmTier: "Delete tier",
    },
    notice: {
      sponsorCreated: (name) => `${name || "Sponsor"} was created.`,
      sponsorUpdated: (name) => `${name || "Sponsor"} was updated.`,
      sponsorDeleted: (name) => `${name || "Sponsor"} was deleted.`,
      tierCreated: (name) => `${name || "Tier"} was created.`,
      tierUpdated: (name) => `${name || "Tier"} was updated.`,
      tierDeleted: (name) => `${name || "Tier"} was deleted.`,
    },
    errors: {
      sponsor_invalid: "Some sponsor details are not valid. Check the form.",
      sponsor_tier_not_found: "That tier no longer exists. Refresh the list.",
      sponsor_not_found: "This sponsor no longer exists. Refresh the list.",
      sponsor_tier_invalid: "Some tier details are not valid. Check the form.",
      image_invalid_type: "That image type is not allowed.",
      image_invalid_base64: "The image could not be read.",
      image_too_large: "The image is larger than the server allows.",
      generic: "The change could not be saved.",
      deleteGeneric: "The record could not be deleted.",
    },
  },
  criteria: {
    eyebrow: "Judging",
    title: "Judging criteria",
    description:
      "Maintain the scoring criteria and the question prompts judges see. Every save sends the complete criterion, including its question list.",
    add: "Add criterion",
    filter: {
      challenge: "Challenge",
      hint: "Some criteria are not linked to a challenge. Choose All challenges to include them in this list.",
    },
    summary: {
      count: (count) =>
        `${count} ${count === 1 ? "criterion" : "criteria"} shown.`,
      totalWeight: (total) =>
        `Total weight: ${total}. This is shown for reference only; the server does not enforce it.`,
    },
    table: {
      caption: "Judging criteria returned by the server",
      name: "Name",
      weight: "Weight",
      maxScore: "Max score",
      questions: "Questions",
      published: "Published judges",
      status: "Status",
      actions: "Actions",
    },
    status: {
      published: "Published",
      unpublished: "Not published",
      judgeCount: (count) => `${count} judge${count === 1 ? "" : "s"}`,
    },
    actions: {
      edit: "Edit",
      delete: "Delete",
    },
    states: {
      loading: "Loading criteria…",
      errorTitle: "Could not load criteria",
      empty: "No criteria match this challenge.",
      emptyAll: "No criteria were returned by the server.",
      challengesLoading: "Loading challenges…",
      challengesError: "Could not load challenges.",
      challengesEmpty:
        "The server returned no challenges. Criteria can still be saved without a challenge.",
    },
    form: {
      createTitle: "Add criterion",
      editTitle: "Edit criterion",
      description:
        "Saving replaces the whole criterion and rebuilds its question numbers from the displayed order.",
      name: "Name",
      nameHint: "Required. Shown to judges.",
      descriptionLabel: "Description",
      descriptionHint: "Optional plain text.",
      maxScore: "Maximum score",
      maxScoreHint: "The highest score a judge can enter for this criterion.",
      weight: "Weight",
      weightHint:
        "Used by standings calculations. The list shows the total weight for reference.",
      challenge: "Challenge",
      challengeHint: "Choose No challenge for a criterion shared across challenges.",
      noChallenge: "No challenge (global)",
      questions: "Questions",
      questionsHint:
        "Add prompts in the order they should appear. Empty questions are not saved.",
      addQuestion: "Add question",
      questionListLabel: "Criterion questions",
      questionLabel: (index) => `Question ${index}`,
      questionTextLabel: (index) => `Question ${index} text`,
      questionPlaceholder: "Enter the question prompt",
      moveUp: "Move up",
      moveDown: "Move down",
      removeQuestion: "Remove",
      questionMoveUp: (index) => `Move question ${index} up`,
      questionMoveDown: (index) => `Move question ${index} down`,
      questionRemove: (index) => `Remove question ${index}`,
      noQuestions:
        "No questions yet. Add a prompt if judges should answer this criterion question by question.",
      questionAdded: (count) =>
        `Question added. ${count} question${count === 1 ? "" : "s"} in the list.`,
      questionRemoved: (index, count) =>
        `Question ${index} removed. ${count} question${
          count === 1 ? " remains" : "s remain"
        }.`,
      questionMoved: (from, to) =>
        `Question ${from} moved to position ${to}.`,
      editWarning:
        "If judges already scored this criterion, changing or removing a question may affect those scores. The server can reject the save and still keep other changes, so refresh after a failed save.",
      submitCreate: "Create criterion",
      submitEdit: "Save changes",
      saving: "Saving…",
      hint: "Fields marked with an asterisk are required.",
      validation: {
        nameRequired: "Enter a criterion name.",
        maxScoreInvalid: "Enter a maximum score of 0 or more.",
        weightInvalid: "Enter a weight of 0 or more.",
        questionEmpty: "Enter text for every question before saving.",
        challengeInvalid: "Choose a valid challenge.",
      },
    },
    confirm: {
      deleteTitle: (name) => `Delete ${name}?`,
      deleteMessage: (name, questionCount, publishedCount) =>
        `Delete ${name} permanently? This removes ${questionCount} question${
          questionCount === 1 ? "" : "s"
        } and every score recorded against this criterion. ${publishedCount} judge${
          publishedCount === 1 ? "" : "s"
        } currently see it as published. This cannot be undone.`,
      typeLabel: (name) => `Type ${name} to confirm.`,
      typeHint: "The name must match exactly before Delete is enabled.",
      confirmDelete: "Delete criterion",
    },
    notice: {
      created: (name) => `${name || "Criterion"} was created.`,
      updated: (name) => `${name || "Criterion"} was updated.`,
      deleted: (name) => `${name || "Criterion"} was deleted.`,
    },
    errors: {
      criterion_not_found:
        "This criterion no longer exists. Refresh the list.",
      criterion_invalid:
        "Some criterion details are not valid. Check the form.",
      challenge_not_found:
        "That challenge no longer exists. Refresh the list and choose another.",
      question_invalid:
        "At least one question is not valid. Check the question text.",
      judging_no_scores:
        "This criterion has no scores to publish for that judge yet.",
      updateConflict:
        "The server could not save the criterion. If scores already exist, removing or replacing a question may be rejected. Refresh and check whether other changes were saved.",
      generic: "The criterion could not be saved.",
      deleteGeneric: "The criterion could not be deleted.",
    },
  },
  publishing: {
    eyebrow: "Judging",
    title: "Publish criteria",
    description:
      "Publish or unpublish scored criteria for every judge who scored or for one judge at a time. Changes are reflected in live standings immediately.",
    note: "Publishing affects the live standings immediately. Choose All judges who scored to target everyone who has saved a score for the criterion, or choose one judge to change only that judge's scores.",
    filters: {
      challenge: "Challenge",
      judge: "Judge",
      allJudges: "All judges who scored",
      judgeHint:
        "With All judges who scored, the request omits judgeId. Choosing one judge sends that judgeId only.",
    },
    table: {
      caption: "Criteria and their publication state",
      name: "Criterion",
      status: "Status",
      judgeCount: "Published judges",
      publishedAt: "Published at",
      actions: "Actions",
    },
    status: {
      published: "Published",
      unpublished: "Not published",
    },
    actions: {
      publish: "Publish",
      unpublish: "Unpublish",
    },
    states: {
      loading: "Loading criteria…",
      errorTitle: "Could not load criteria",
      empty: "No criteria match this challenge.",
      emptyAll: "No criteria were returned by the server.",
      judgesLoading: "Loading judges…",
      judgesError: "Could not load judges.",
      judgesEmpty:
        "No judge accounts with a judge id were returned. Publishing still targets every judge who scored.",
      challengesLoading: "Loading challenges…",
      challengesError: "Could not load challenges.",
      challengesEmpty:
        "The server returned no challenges. Choose All challenges to include unscoped criteria.",
    },
    judgeOption: (name, username) =>
      username ? `${name || "Judge"} (${username})` : name || "Judge",
    confirm: {
      publishTitle: "Publish this criterion?",
      unpublishTitle: "Unpublish this criterion?",
      scope: (judgeLabel) =>
        judgeLabel
          ? `for ${judgeLabel}`
          : "for all judges who have scored",
      publishMessage: (name, judgeLabel) =>
        `Publish ${name || "this criterion"} ${publishScope(judgeLabel)}? Live standings change immediately.`,
      unpublishMessage: (name, judgeLabel) =>
        `Unpublish ${name || "this criterion"} ${publishScope(judgeLabel)}? Live standings change immediately.`,
      confirmPublish: "Publish now",
      confirmUnpublish: "Unpublish now",
    },
    notice: {
      published: (name, judgeLabel) =>
        `${name || "Criterion"} was published ${publishScope(judgeLabel)}.`,
      unpublished: (name, judgeLabel) =>
        `${name || "Criterion"} was unpublished ${publishScope(judgeLabel)}.`,
    },
    errors: {
      judging_no_scores:
        "There are no saved scores to publish for that judge. Nothing was changed.",
      criterion_not_found:
        "This criterion no longer exists. Refresh the list.",
      judge_not_found:
        "That judge no longer exists. Refresh the list and choose another.",
      publishGeneric: "The criterion could not be published.",
      unpublishGeneric: "The criterion could not be unpublished.",
    },
  },
  questions: {
    eyebrow: "Quiz",
    title: "Quiz questions",
    description:
      "Create multiple-choice and free-text questions, publish them to participants and keep the answer key current.",
    add: "Add question",
    filters: {
      challenge: "Challenge",
      status: "Status",
      allStatuses: "All questions",
      published: "Published",
      unpublished: "Unpublished",
      search: "Search",
      searchPlaceholder: "Question text, type or challenge",
      searchHint: "The status filter and search run in this browser.",
    },
    table: {
      caption: "Quiz questions returned by the server",
      text: "Question",
      type: "Type",
      points: "Points",
      published: "Published",
      challenge: "Challenge",
      actions: "Actions",
    },
    typeLabels: {
      "multiple-choice": "Multiple choice",
      text: "Free text",
    },
    status: {
      published: "Published",
      unpublished: "Unpublished",
    },
    actions: {
      edit: "Edit",
      publish: "Publish",
      unpublish: "Unpublish",
      delete: "Delete",
    },
    states: {
      loading: "Loading questions…",
      errorTitle: "Could not load questions",
      empty: "No questions match these filters.",
      emptyAll: "No questions were returned by the server.",
      challengesLoading: "Loading challenges…",
      challengesError: "Could not load challenges.",
      challengesEmpty:
        "The server returned no challenges. A question cannot be created until a challenge exists.",
    },
    form: {
      createTitle: "Add question",
      editTitle: "Edit question",
      description:
        "Multiple-choice options are sent as a JSON string. The correct answer must match one of those options.",
      challenge: "Challenge",
      challengeHint: "Required. Participants answer this question in the challenge game.",
      type: "Type",
      typeHint: "The two types accepted by the server are multiple-choice and text.",
      text: "Question text",
      textHint: "Plain text only.",
      points: "Points",
      pointsHint: "Whole number of 0 or more.",
      options: "Answer options",
      optionsHint:
        "Add at least two options. Each option must be non-empty and different from the others.",
      optionListLabel: "Answer options",
      optionLabel: (index) => `Option ${index}`,
      optionPlaceholder: "Enter an answer option",
      addOption: "Add option",
      moveUp: "Move up",
      moveDown: "Move down",
      removeOption: "Remove",
      optionMoveUp: (index) => `Move option ${index} up`,
      optionMoveDown: (index) => `Move option ${index} down`,
      optionRemove: (index) => `Remove option ${index}`,
      optionCorrect: (index) => `Mark option ${index} as the correct answer`,
      correctLegend: "Correct answer",
      correctOptionHint: "Select the radio button next to the correct option.",
      correctText: "Correct answer text",
      correctTextHint: "The answer is compared as plain text.",
      optionsAdded: (count) =>
        `Option added. ${count} option${count === 1 ? "" : "s"} in the list.`,
      optionsRemoved: (index, count) =>
        `Option ${index} removed. ${count} option${
          count === 1 ? " remains" : "s remain"
        }.`,
      optionsMoved: (from, to) =>
        `Option ${from} moved to position ${to}.`,
      correctSelected: (index) =>
        `Option ${index} is now the correct answer.`,
      optionsRebuild:
        "The stored options could not be read, so the option list was reset. Rebuild the options before saving.",
      correctRebuild:
        "The stored correct answer does not match any option. Choose the correct option before saving.",
      submitCreate: "Create question",
      submitEdit: "Save changes",
      saving: "Saving…",
      hint: "Fields marked with an asterisk are required.",
      validation: {
        challengeRequired: "Choose a challenge.",
        typeRequired: "Choose multiple choice or free text.",
        textRequired: "Enter the question text.",
        pointsInvalid: "Enter a whole number of 0 or more.",
        optionsMin: "Add at least two options.",
        optionEmpty: "Every option must have text.",
        optionsUnique: "Options must be different.",
        correctOptionRequired: "Choose the correct option.",
        correctTextRequired: "Enter the correct answer text.",
      },
    },
    confirm: {
      deleteTitle: "Delete this question?",
      deleteMessage: (text) =>
        `Delete ${text || "this question"}? It is hidden from this list and from participants. The record stays in the database, but it cannot be restored from this page.`,
      publishTitle: "Publish this question?",
      publishMessage: (text) =>
        `Publish ${text || "this question"}? Participants can receive it immediately.`,
      unpublishTitle: "Unpublish this question?",
      unpublishMessage: (text) =>
        `Unpublish ${text || "this question"}? Participants will no longer receive it.`,
      confirmDelete: "Delete question",
      confirmPublish: "Publish now",
      confirmUnpublish: "Unpublish now",
    },
    notice: {
      created: (text) => `${text || "Question"} was created.`,
      updated: (text) => `${text || "Question"} was updated.`,
      published: (text) => `${text || "Question"} was published.`,
      unpublished: (text) => `${text || "Question"} was unpublished.`,
      deleted: (text) => `${text || "Question"} was deleted.`,
    },
    errors: {
      question_invalid: "Some question details are not valid. Check the form.",
      question_not_found:
        "This question no longer exists. Refresh the list.",
      challenge_not_found:
        "That challenge no longer exists. Refresh the list and choose another.",
      generic: "The question could not be saved.",
      deleteGeneric: "The question could not be deleted.",
      publishGeneric: "The question could not be published.",
      unpublishGeneric: "The question could not be unpublished.",
    },
  },
};

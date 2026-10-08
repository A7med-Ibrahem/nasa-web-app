/* ==========================================================================
   Organizer & Judge Login page content
   --------------------------------------------------------------------------
   Copy for the `/login` screen: compact header, portal introduction, feature
   list and the sign-in card. Every string lives here so the components stay
   markup-only.

   BRANDING: this project is NASA Space Apps **Hurghada**. Reference designs
   for this screen have named a different Egyptian city — that wording must
   never appear in this file or anywhere else in the app.

   Like the other data modules this is intentionally plain static data, so the
   whole export can later be swapped for an API response of identical shape.
   ========================================================================== */

export const loginPage = {
  /* Compact page header (the login screen has its own header rather than
     the main Navbar). */
  header: {
    brand: "NASA SPACE APPS",
    location: "Hurghada",
    locationLabel: "Local Event",
    back: { label: "Back to Event", href: "/" },
  },

  /* Left-hand introduction. */
  hero: {
    eyebrow: "NASA SPACE APPS HURGHADA",
    titleLines: ["Organizer &", "Judge Portal"],
    description:
      "Sign in to manage and evaluate submissions, and help build a better tomorrow.",
    features: [
      { id: "review", icon: "scale", lines: ["Review", "Submissions"] },
      { id: "evaluate", icon: "bulb", lines: ["Evaluate", "Solutions"] },
      { id: "support", icon: "users", lines: ["Support", "Great Teams"] },
    ],
  },

  /* Sign-in card. */
  card: {
    title: "Organizer & Judge Portal",
    subtitle: "Sign in to access your event dashboard",
  },

  /* Form labels, placeholders, messages. `identifier` accepts either an email
     or a username, so validation only checks presence — never an email
     pattern. The shape of the submitted values ({ identifier, password,
     rememberMe }) mirrors what a future POST /auth/login body will carry. */
  form: {
    identifierLabel: "Email or Username",
    identifierPlaceholder: "your.email@domain.com",
    identifierError: "Enter your email or username.",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    passwordError: "Enter your password.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    forgotPasswordNote: "Password reset is coming soon",
    submit: "Sign In",
    or: "OR",
    back: { label: "Back to Event", href: "/" },
    /* Shown after a locally valid submit. Deliberately states that nothing
       has been authenticated yet — there is no backend in this project. */
    readyMessage:
      "Details checked locally. Sign-in will activate once the authentication service is connected.",
  },
};

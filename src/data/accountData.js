/* ==========================================================================
   Account area copy
   --------------------------------------------------------------------------
   Wording for authenticated account actions. No account data lives here: the
   signed-in identity always comes from the backend session.
   ========================================================================== */

export const accountData = {
  nav: {
    changePassword: "Change password",
  },
  changePassword: {
    eyebrow: "Account security",
    title: "Change password",
    description:
      "Update the password used to sign in to your NASA Space Apps Hurghada account.",
    card: {
      title: "Update your password",
      description:
        "Enter your current password, then choose a new one. Your session stays active after a successful change.",
    },
    fields: {
      currentPassword: {
        label: "Current password",
        placeholder: "Enter your current password",
        required: "Enter your current password.",
      },
      newPassword: {
        label: "New password",
        placeholder: "At least 6 characters",
        hint: "Use at least 6 characters.",
        required: "Enter a new password.",
        minLength: "The new password must be at least 6 characters.",
        unchanged:
          "The new password must be different from your current password.",
      },
      confirmPassword: {
        label: "Confirm new password",
        placeholder: "Re-enter the new password",
        required: "Confirm your new password.",
        mismatch: "The confirmation does not match the new password.",
      },
    },
    showPassword: "Show password",
    hidePassword: "Hide password",
    submit: "Change password",
    submitting: "Changing password…",
    success: "Password changed successfully.",
    errors: {
      "auth.invalid_current_password": "The current password is incorrect.",
      "auth.weak_password":
        "The new password must be at least 6 characters.",
      "auth.password_unchanged":
        "The new password must be different from your current password.",
      "auth.account_inactive":
        "This account is inactive and cannot change its password.",
      "user.unauthenticated":
        "Your session is no longer valid. Please sign in again.",
      forbidden: "You do not have permission to change this password.",
      network:
        "Could not reach the server. Check your connection and try again.",
      generic: "The password could not be changed. Please try again.",
    },
  },
};

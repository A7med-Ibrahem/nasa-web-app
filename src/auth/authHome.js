export function homeForRole(role) {
  if (role === "Judge") {
    return "/judge";
  }
  if (role === "Participant") {
    return "/participant/dashboard";
  }
  return "/";
}

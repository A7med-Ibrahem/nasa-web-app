export function homeForRole(role) {
  if (role === "Judge") {
    return "/judge";
  }
  if (role === "Participant") {
    return "/participant/dashboard";
  }
  if (role === "Admin" || role === "CoreTeam") {
    return "/staff/requests";
  }
  return "/";
}

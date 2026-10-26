export function homeForRole(role) {
  if (role === "Judge") {
    return "/judge";
  }
  if (role === "Participant") {
    return "/participant/dashboard";
  }
  if (role === "Admin") {
    return "/admin";
  }
  if (role === "CoreTeam") {
    return "/staff/requests";
  }
  return "/";
}

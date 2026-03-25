import type { Profile, UserRole } from "@/types/app";

export function isAdmin(profile: Profile): boolean {
  return profile.role === "admin";
}

export function isClient(profile: Profile): boolean {
  return profile.role === "client";
}

export function canViewInternalNotes(profile: Profile): boolean {
  return isAdmin(profile);
}

export function canEditRequest(profile: Profile): boolean {
  return isAdmin(profile);
}

export function canDeleteRequest(profile: Profile): boolean {
  return isAdmin(profile);
}

export function canAccessBeheer(profile: Profile): boolean {
  return isAdmin(profile);
}

export function getRoleLabel(role: UserRole): string {
  return role === "admin" ? "Beheerder" : "Aanvrager";
}

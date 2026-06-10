export const getInitials = (fullName: string): string => {
  if (!fullName?.trim()) return '';

  const parts = fullName.trim().split(/\s+/);

  // First and last name available
  if (parts.length > 1) {
    const firstInitial = parts[0][0];
    const lastInitial = parts[parts.length - 1][0];

    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  // Single name: take first two letters
  return parts[0].slice(0, 2).toUpperCase();
};

const inviteRoute = "/invite";

export const generateInvitationRoute = (token: string) => {
  return `${inviteRoute}/${token}`;
};

export const generateInvitationLink = (token: string) => {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${generateInvitationRoute(token)}`;
};

export const generateExpirationDate = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  
  return date.toISOString();
};

import { LINKS } from "@/const";

const inviteRoute = "/invite";

export const generateInvitationRoute = (token: string) => {
  return `${inviteRoute}/${token}`;
};

export const generateProjectRoute = (projectId: string) => {
  return `${LINKS.PROJECTS}/${projectId}`;
};

export const generateListRoute = (projectId: string, listId: string) => {
  return `${generateProjectRoute(projectId)}/lists/${listId}`;
};

export const generateInvitationLink = (token: string) => {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${generateInvitationRoute(token)}`;
};

export const generateExpirationDate = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  
  return date.toISOString();
};

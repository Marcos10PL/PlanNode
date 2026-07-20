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

export const getTaskListSortCookie = (listId: string) =>
  `task_list_sort_${listId}`;

export const getTaskListCollapsedCookie = (listId: string) =>
  `task_list_collapsed_${listId}`;

export const parseCookieValue = <T>(
  raw: string | undefined,
  fallback: T,
): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

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

export const generateProjectTrashRoute = (projectId: string) => {
  return `${generateProjectRoute(projectId)}/trash`;
};

export const generateAbsoluteUrl = (path: string) => {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${path}`;
};

export const generateInvitationLink = (token: string) => {
  return generateAbsoluteUrl(generateInvitationRoute(token));
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

export const getTaskListViewCookie = (listId: string) =>
  `task_list_view_${listId}`;

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

export const isHtmlContentEmpty = (html: string) => {
  return !html.replace(/<[^>]*>/g, "").trim();
};

export const getHtmlTextLength = (html: string) => {
  return html.replace(/<[^>]*>/g, "").length;
};

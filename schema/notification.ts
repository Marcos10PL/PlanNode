import { NOTIFICATION_TYPES } from "@/const";
import { z } from "zod";

export const updateNotificationPreferencesSchema = () =>
  z.object({
    preferences: z
      .array(
        z.object({
          type: z.enum(NOTIFICATION_TYPES),
          emailEnabled: z.boolean(),
          inAppEnabled: z.boolean(),
        }),
      )
      .min(1),
  });

export type UpdateNotificationPreferencesSchema = z.infer<
  ReturnType<typeof updateNotificationPreferencesSchema>
>;

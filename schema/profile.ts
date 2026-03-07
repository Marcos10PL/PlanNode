import { z } from "zod";
import { createDefaultFields, type Transalations } from "./defaults";

export const createProfileAccountSchema = (t: Transalations) => {
  return z.object({
    full_name: z.string().max(255).optional(),
    new_email: z.union([z.literal(""), createDefaultFields(t).email]),
    new_password: z.union([z.literal(""), createDefaultFields(t).password]),
  });
};

export type ProfileAccountSchema = z.infer<
  ReturnType<typeof createProfileAccountSchema>
>;

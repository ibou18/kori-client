import * as z from "zod";

export const personalInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, "Le nom complet doit comporter au moins 2 caractères"),
  address: z.string().min(5, "Veuillez entrer une adresse valide"),
  phoneNumber: z
    .string()
    .regex(/^[0-9+\s]{10,15}$/, "Numéro de téléphone invalide"),
});

export type PersonalInfoType = z.infer<typeof personalInfoSchema>;

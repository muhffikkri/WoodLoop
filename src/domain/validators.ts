import { z } from "zod";

export const woodFormSchema = z.enum(["board", "strip", "block", "other"]);
export const quantityUnitSchema = z.enum(["pieces", "sets"]);

const optionalPositiveMeasurement = z
  .number()
  .positive("Enter a measurement greater than 0 mm.")
  .nullable()
  .optional();

export const dimensionsSchema = z.object({
  length: optionalPositiveMeasurement,
  width: optionalPositiveMeasurement,
  thickness: optionalPositiveMeasurement,
  notes: z.string().trim().max(240).optional(),
  approximate: z.boolean(),
});

export const listingInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, "Use at least 5 characters.")
      .max(80, "Keep the title under 80 characters."),
    description: z.string().trim().max(800).optional(),
    woodForm: woodFormSchema,
    dimensions: dimensionsSchema,
    quantityTotal: z
      .number()
      .int("Quantity must be a whole number.")
      .positive("Quantity must be greater than 0."),
    unit: quantityUnitSchema,
    sourceProcess: z.string().trim().min(2).max(120),
    region: z.string().trim().min(2).max(120),
    pickupDetails: z.string().trim().max(500).optional(),
    availableFrom: z.string().optional(),
    visibleConditionNotes: z.string().trim().max(500).optional(),
    declaredSpecies: z.string().trim().max(120).nullable().optional(),
    declaredTreatment: z
      .enum(["untreated", "treated", "unsure"])
      .nullable()
      .optional(),
    photoIds: z.array(z.string().min(1)).min(1).max(8),
  })
  .superRefine((value, context) => {
    if (value.declaredTreatment === "treated") {
      context.addIssue({
        code: "custom",
        path: ["declaredTreatment"],
        message: "Treated material cannot be published in the WoodLoop MVP.",
      });
    }
  });

export const newRequestSchema = z.object({
  listingId: z.string().min(1),
  requestedQuantity: z
    .number()
    .int("Quantity must be a whole number.")
    .positive("Quantity must be greater than 0."),
  unit: quantityUnitSchema,
  message: z.string().trim().min(1).max(1000),
  fulfillmentMethod: z.enum(["pickup", "delivery_to_discuss"]),
});

export const photoMetadataSchema = z.object({
  type: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z
    .number()
    .max(10 * 1024 * 1024, "Each photo must be 10 MB or smaller."),
});

export const demoLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const localDemoProfileSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "Use at least 2 characters.")
      .max(60, "Keep the name under 60 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Enter your work email.")
      .email("Enter a valid email address."),
    role: z.enum(["buyer", "supplier", "both"], {
      message: "Choose how you want to use WoodLoop.",
    }),
  })
  .transform((value) => ({
    ...value,
    displayName: value.displayName.trim(),
    email: value.email.trim().toLowerCase(),
  }));

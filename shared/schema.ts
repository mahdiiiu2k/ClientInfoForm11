import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const clientSubmissions = pgTable("client_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  yearsOfExperience: integer("years_of_experience"),
  businessEmail: text("business_email"),
  
  hasLicense: boolean("has_license").default(false),
  licenseNumber: text("license_number"),
  
  businessAddress: text("business_address"),
  businessHours: text("business_hours"),
  
  hasEmergencyServices: boolean("has_emergency_services").default(false),
  hasEmergencyPhone: boolean("has_emergency_phone"),
  emergencyPhone: text("emergency_phone"),
  
  // About Section
  enableAboutModifications: boolean("enable_about_modifications").default(false),
  companyStory: text("company_story"),
  uniqueSellingPoints: text("unique_selling_points"),
  specialties: text("specialties"),
  
  // Services (JSON array)
  services: json("services").$type<Array<{
    name: string;
    description: string;
    steps?: string;
    pictureUrls?: string[];
  }>>().default([]),
  
  // Projects (JSON array)
  projects: json("projects").$type<Array<{
    title: string;
    description: string;
    beforeAfter: boolean;
    beforePictureUrls?: string[];
    afterPictureUrls?: string[];
    pictureUrls?: string[];
    clientFeedback?: string;
  }>>().default([]),
  
  // Warranty & Insurance
  hasWarranty: boolean("has_warranty").default(false),
  warrantyDescription: text("warranty_description"),
  warrantyDuration: text("warranty_duration"),
  warrantyType: text("warranty_type"),
  warrantyAdditionalNotes: text("warranty_additional_notes"),
  hasInsurance: boolean("has_insurance").default(false),
  generalLiability: text("general_liability"),
  workersCompensation: boolean("workers_compensation").default(false),
  bondedAmount: text("bonded_amount"),
  additionalCoverage: text("additional_coverage"),
  
  // Service Areas (JSON array)
  serviceAreas: json("service_areas").$type<Array<{
    type: 'neighborhoods' | 'cities' | 'counties' | 'radius';
    name: string;
    description?: string;
  }>>().default([]),
  serviceAreasDescription: text("service_areas_description"),
  
  // Financing Options (JSON array)
  financingOptions: json("financing_options").$type<Array<{
    name: string;
    description: string;
    interestRate?: string;
    termLength?: string;
    minimumAmount?: string;
    qualificationRequirements?: string;
  }>>().default([]),
  
  // Storm Services (JSON array)
  stormServices: json("storm_services").$type<Array<{
    serviceName: string;
    serviceDescription: string;
    responseTime?: string;
    insurancePartnership?: string;
  }>>().default([]),
  
  // Additional Optional Sections
  hasFinancingOptions: boolean("has_financing_options").default(false),
  financingDetails: text("financing_details"),
  hasStormServices: boolean("has_storm_services").default(false),
  stormServiceDetails: text("storm_service_details"),
  hasBrandsWorkedWith: boolean("has_brands_worked_with").default(false),
  brands: json("brands").$type<Array<string>>().default([]),
  brandsAdditionalNotes: text("brands_additional_notes"),
  hasCertificationsAwards: boolean("has_certifications_awards").default(false),
  certificationsAwards: text("certifications_awards"),
  hasInstallationProcess: boolean("has_installation_process").default(false),
  installationProcessDetails: text("installation_process_details"),
  hasMaintenanceGuide: boolean("has_maintenance_guide").default(false),
  maintenanceGuide: text("maintenance_guide"),
  hasRoofMaterials: boolean("has_roof_materials").default(false),
  roofMaterialsDetails: text("roof_materials_details"),
  
  additionalNotes: text("additional_notes"),
  
  createdAt: text("created_at").default(sql`NOW()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertClientSubmissionSchema = createInsertSchema(clientSubmissions).omit({
  id: true,
  createdAt: true,
}).extend({
  // Make all validation optional
  yearsOfExperience: z.number().min(0).max(50).optional(),
  businessEmail: z.string().optional(),
  emergencyPhone: z.string().nullable().optional(),
  licenseNumber: z.string().nullable().optional(),
  businessAddress: z.string().nullable().optional(),
  businessHours: z.string().nullable().optional(),
  companyStory: z.string().nullable().optional(),
  uniqueSellingPoints: z.string().nullable().optional(),
  specialties: z.string().nullable().optional(),
  warrantyDescription: z.string().nullable().optional(),
  generalLiability: z.string().nullable().optional(),
  bondedAmount: z.string().nullable().optional(),
  additionalCoverage: z.string().nullable().optional(),
  financingDetails: z.string().nullable().optional(),
  stormServiceDetails: z.string().nullable().optional(),
  brandsAdditionalNotes: z.string().nullable().optional(),
  certificationsAwards: z.string().nullable().optional(),
  installationProcessDetails: z.string().nullable().optional(),
  maintenanceGuide: z.string().nullable().optional(),
  roofMaterialsDetails: z.string().nullable().optional(),
  additionalNotes: z.string().nullable().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ClientSubmission = typeof clientSubmissions.$inferSelect;
export type InsertClientSubmission = z.infer<typeof insertClientSubmissionSchema>;

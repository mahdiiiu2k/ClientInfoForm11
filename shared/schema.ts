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
  // Basic Information
  yearsOfExperience: integer("years_of_experience").notNull(),
  businessEmail: text("business_email").notNull(),
  
  // License Information
  hasLicense: boolean("has_license").notNull(),
  licenseNumber: text("license_number"),
  
  // Business Details
  businessAddress: text("business_address"),
  businessHours: text("business_hours"),
  
  // Emergency Services
  hasEmergencyServices: boolean("has_emergency_services").notNull(),
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
  // Add additional validation
  yearsOfExperience: z.number().min(0).max(50),
  businessEmail: z.string().email(),
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
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ClientSubmission = typeof clientSubmissions.$inferSelect;
export type InsertClientSubmission = z.infer<typeof insertClientSubmissionSchema>;

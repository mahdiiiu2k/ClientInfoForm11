import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import { sendFormEmail } from "./email";
import { uploadImage } from "./cloudinary";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Image upload endpoint
  app.post("/api/upload-images", upload.array('images', 10), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadPromises = req.files.map(async (file) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        const cloudinaryUrl = await uploadImage(file.buffer, fileName);
        return cloudinaryUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);
      res.json({ success: true, imageUrls });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ message: "Failed to upload images" });
    }
  });

  // Client submission endpoint
  app.post("/api/client-submissions", async (req, res) => {
    try {
      console.log('Raw request body received:', JSON.stringify(req.body, null, 2));
      const validatedData = insertClientSubmissionSchema.parse(req.body);
      console.log('Validated data:', JSON.stringify(validatedData, null, 2));
      const submission = await storage.createClientSubmission(validatedData);
      
      // Send email with form data
      try {
        await sendFormEmail({
          yearsOfExperience: validatedData.yearsOfExperience,
          businessEmail: validatedData.businessEmail,
          hasLicense: validatedData.hasLicense,
          licenseNumber: validatedData.licenseNumber,
          businessAddress: validatedData.businessAddress,
          businessHours: validatedData.businessHours,
          hasEmergencyServices: validatedData.hasEmergencyServices,
          hasEmergencyPhone: validatedData.hasEmergencyPhone,
          emergencyPhone: validatedData.emergencyPhone,
          enableAboutModifications: validatedData.enableAboutModifications,
          companyStory: validatedData.companyStory,
          uniqueSellingPoints: validatedData.uniqueSellingPoints,
          specialties: validatedData.specialties,
          services: validatedData.services as Array<{
            name?: string;
            description?: string;
            steps?: string;
            picture?: string;
            pictureUrls?: string[];
          }> | null,
          projects: validatedData.projects as Array<{
            title?: string;
            description?: string;
            beforeAfter?: boolean;
            beforePictureUrls?: string[];
            afterPictureUrls?: string[];
            pictureUrls?: string[];
            clientFeedback?: string;
          }> | null,
          serviceAreas: validatedData.serviceAreas as Array<{
            type?: string;
            name?: string;
            description?: string;
          }> | null,
          serviceAreasDescription: validatedData.serviceAreasDescription || undefined,
          financingOptions: validatedData.financingOptions as Array<{
            name?: string;
            description?: string;
            interestRate?: string;
            termLength?: string;
            minimumAmount?: string;
            qualificationRequirements?: string;
          }> | null,
          stormServices: validatedData.stormServices as Array<{
            serviceName?: string;
            serviceDescription?: string;
            responseTime?: string;
            insurancePartnership?: string;
          }> | null,
          brands: validatedData.brands as Array<string> | null,
          brandsAdditionalNotes: validatedData.brandsAdditionalNotes || undefined,
          certifications: validatedData.certifications as Array<string> | null,
          certificationPictureUrls: validatedData.certificationPictureUrls as Array<string> | null,
          certificationsAdditionalNotes: validatedData.certificationsAdditionalNotes || undefined,
          installationProcessServices: validatedData.installationProcessServices as Array<{
            serviceName?: string;
            steps?: string[];
            additionalNotes?: string;
            pictureUrls?: string[];
          }> | null,
          hasMaintenanceGuide: validatedData.hasMaintenanceGuide,
          maintenanceTips: validatedData.maintenanceTips as Array<string> | null,
          hasRoofMaterials: validatedData.hasRoofMaterials,
          roofMaterialsSpecialties: validatedData.roofMaterialsSpecialties,
          hasWarranty: validatedData.hasWarranty,
          warrantyDuration: validatedData.warrantyDuration,
          warrantyType: validatedData.warrantyType,
          warrantyCoverageDetails: validatedData.warrantyCoverageDetails,
          warrantyTerms: validatedData.warrantyTerms as Array<string> | null,
          warrantyAdditionalNotes: validatedData.warrantyAdditionalNotes,
          hasInsurance: validatedData.hasInsurance,
          generalLiability: validatedData.generalLiability,
          workersCompensation: validatedData.workersCompensation,
          bondedAmount: validatedData.bondedAmount,
          additionalCoverage: validatedData.additionalCoverage,
          hasAdditionalNotes: validatedData.hasAdditionalNotes,
          additionalNotes: validatedData.additionalNotes,
        });
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Continue with response even if email fails
      }
      
      res.json({ success: true, id: submission.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        console.error("Error creating client submission:", error);
        res.status(500).json({ 
          message: "Internal server error" 
        });
      }
    }
  });

  // Get all client submissions endpoint
  app.get("/api/client-submissions", async (req, res) => {
    try {
      const submissions = await storage.getAllClientSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching client submissions:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  // Get client submission by ID endpoint
  app.get("/api/client-submissions/:id", async (req, res) => {
    try {
      const submission = await storage.getClientSubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ 
          message: "Client submission not found" 
        });
      }
      res.json(submission);
    } catch (error) {
      console.error("Error fetching client submission:", error);
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

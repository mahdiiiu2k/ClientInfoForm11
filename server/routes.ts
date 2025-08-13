import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import { sendFormEmail } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Client submission endpoint
  app.post("/api/client-submissions", async (req, res) => {
    try {
      const validatedData = insertClientSubmissionSchema.parse(req.body);
      const submission = await storage.createClientSubmission(validatedData);
      
      // Send email with form data
      try {
        await sendFormEmail({
          yearsOfExperience: validatedData.yearsOfExperience,
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

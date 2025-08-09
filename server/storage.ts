import { type User, type InsertUser, type ClientSubmission, type InsertClientSubmission } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Client submission methods
  createClientSubmission(submission: InsertClientSubmission): Promise<ClientSubmission>;
  getClientSubmission(id: string): Promise<ClientSubmission | undefined>;
  getAllClientSubmissions(): Promise<ClientSubmission[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private clientSubmissions: Map<string, ClientSubmission>;

  constructor() {
    this.users = new Map();
    this.clientSubmissions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createClientSubmission(insertSubmission: InsertClientSubmission): Promise<ClientSubmission> {
    const id = randomUUID();
    const submission: ClientSubmission = { 
      ...insertSubmission,
      id,
      createdAt: new Date().toISOString(),
      // Convert undefined to null for database compatibility
      licenseNumber: insertSubmission.licenseNumber ?? null,
      businessAddress: insertSubmission.businessAddress ?? null,
      businessHours: insertSubmission.businessHours ?? null,
      emergencyPhone: insertSubmission.emergencyPhone ?? null,
      hasEmergencyPhone: insertSubmission.hasEmergencyPhone ?? null,
      enableAboutModifications: insertSubmission.enableAboutModifications ?? null,
      companyStory: insertSubmission.companyStory ?? null,
      uniqueSellingPoints: insertSubmission.uniqueSellingPoints ?? null,
      specialties: insertSubmission.specialties ?? null,
      hasWarranty: insertSubmission.hasWarranty ?? null,
      warrantyDescription: insertSubmission.warrantyDescription ?? null,
      hasInsurance: insertSubmission.hasInsurance ?? null,
      generalLiability: insertSubmission.generalLiability ?? null,
      workersCompensation: insertSubmission.workersCompensation ?? null,
      bondedAmount: insertSubmission.bondedAmount ?? null,
      additionalCoverage: insertSubmission.additionalCoverage ?? null,
    };
    this.clientSubmissions.set(id, submission);
    return submission;
  }

  async getClientSubmission(id: string): Promise<ClientSubmission | undefined> {
    return this.clientSubmissions.get(id);
  }

  async getAllClientSubmissions(): Promise<ClientSubmission[]> {
    return Array.from(this.clientSubmissions.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }
}

export const storage = new MemStorage();

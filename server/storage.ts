import { recordings, type Recording, type InsertRecording, users, type User, type InsertUser } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Recording methods
  getAllRecordings(): Promise<Recording[]>;
  getRecording(id: number): Promise<Recording | undefined>;
  createRecording(recording: InsertRecording): Promise<Recording>;
  deleteRecording(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private recordings: Map<number, Recording>;
  private userCurrentId: number;
  private recordingCurrentId: number;

  constructor() {
    this.users = new Map();
    this.recordings = new Map();
    this.userCurrentId = 1;
    this.recordingCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Recording methods
  async getAllRecordings(): Promise<Recording[]> {
    return Array.from(this.recordings.values()).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getRecording(id: number): Promise<Recording | undefined> {
    return this.recordings.get(id);
  }

  async createRecording(insertRecording: InsertRecording): Promise<Recording> {
    const id = this.recordingCurrentId++;
    const recording: Recording = { 
      ...insertRecording, 
      id, 
      createdAt: new Date() 
    };
    this.recordings.set(id, recording);
    return recording;
  }

  async deleteRecording(id: number): Promise<boolean> {
    return this.recordings.delete(id);
  }
}

export const storage = new MemStorage();

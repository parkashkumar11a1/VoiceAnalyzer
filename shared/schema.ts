import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Recording schema
export const recordings = pgTable("recordings", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  audioUrl: text("audio_url").notNull(),
  filename: text("filename").notNull(),
  duration: integer("duration").notNull(), // duration in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRecordingSchema = createInsertSchema(recordings).pick({
  question: true,
  audioUrl: true,
  filename: true,
  duration: true,
});

export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type Recording = typeof recordings.$inferSelect;

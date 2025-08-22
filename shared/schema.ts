import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table - integrated with Clerk Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Clerk user ID
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User apps table - stores analyzed applications
export const apps = pgTable("apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  url: text("url").notNull(),
  name: varchar("name"),
  description: text("description"),
  targetAudience: text("target_audience"),
  painPoints: jsonb("pain_points").$type<string[]>(),
  features: jsonb("features").$type<string[]>(),
  tags: jsonb("tags").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subreddits table - stores discovered and monitored subreddits
export const subreddits = pgTable("subreddits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  appId: varchar("app_id").notNull(),
  name: varchar("name").notNull(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  subscribers: integer("subscribers"),
  activity: varchar("activity"), // high, medium, low
  matchScore: decimal("match_score", { precision: 5, scale: 2 }),
  isMonitored: boolean("is_monitored").default(false),
  lastScanned: timestamp("last_scanned"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insights table - stores discovered pain points and trends
export const insights = pgTable("insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  appId: varchar("app_id").notNull(),
  subredditId: varchar("subreddit_id").notNull(),
  type: varchar("type").notNull(), // pain_point, feature_request, trend
  title: text("title").notNull(),
  content: text("content").notNull(),
  url: text("url"),
  upvotes: integer("upvotes"),
  comments: integer("comments"),
  sentiment: varchar("sentiment"), // positive, negative, neutral
  priority: varchar("priority"), // high, medium, low
  tags: jsonb("tags").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Posts table - stores drafted and published posts
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  appId: varchar("app_id").notNull(),
  subredditId: varchar("subreddit_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: varchar("status").notNull().default("draft"), // draft, approved, published
  redditPostId: varchar("reddit_post_id"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activities table - stores user activity log
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // scan, post_generated, subreddit_added, etc.
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  apps: many(apps),
  subreddits: many(subreddits),
  insights: many(insights),
  posts: many(posts),
  activities: many(activities),
}));

export const appsRelations = relations(apps, ({ one, many }) => ({
  user: one(users, {
    fields: [apps.userId],
    references: [users.id],
  }),
  subreddits: many(subreddits),
  insights: many(insights),
  posts: many(posts),
}));

export const subredditsRelations = relations(subreddits, ({ one, many }) => ({
  user: one(users, {
    fields: [subreddits.userId],
    references: [users.id],
  }),
  app: one(apps, {
    fields: [subreddits.appId],
    references: [apps.id],
  }),
  insights: many(insights),
  posts: many(posts),
}));

export const insightsRelations = relations(insights, ({ one }) => ({
  user: one(users, {
    fields: [insights.userId],
    references: [users.id],
  }),
  app: one(apps, {
    fields: [insights.appId],
    references: [apps.id],
  }),
  subreddit: one(subreddits, {
    fields: [insights.subredditId],
    references: [subreddits.id],
  }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  app: one(apps, {
    fields: [posts.appId],
    references: [apps.id],
  }),
  subreddit: one(subreddits, {
    fields: [posts.subredditId],
    references: [subreddits.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertAppSchema = createInsertSchema(apps).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubredditSchema = createInsertSchema(subreddits).omit({ id: true, createdAt: true });
export const insertInsightSchema = createInsertSchema(insights).omit({ id: true, createdAt: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertApp = z.infer<typeof insertAppSchema>;
export type App = typeof apps.$inferSelect;
export type InsertSubreddit = z.infer<typeof insertSubredditSchema>;
export type Subreddit = typeof subreddits.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type Insight = typeof insights.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

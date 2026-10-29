import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  uniqueIndex,
  uuid,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  sessionVersion: integer('session_version').notNull().default(0),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
}, (table) => [
  uniqueIndex('team_members_user_team_unique').on(table.userId, table.teamId),
]);

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});


/**
 * Durable SaaS ownership/provisioning record.
 * NOT a Medusa order/stock/customer database. A merchant is not ACTIVE until
 * a real isolated commerce backend is connected and independently verified.
 */
export const merchantProvisions = pgTable('merchant_provisions', {
  id: uuid('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id).unique(),
  slug: varchar('slug', { length: 48 }).notNull().unique(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  state: varchar('state', { length: 24 }).notNull().default('requested'),
  attempts: integer('attempts').notNull().default(0),
  lastError: text('last_error'),
  edgeSyncedAt: timestamp('edge_synced_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type MerchantProvision = typeof merchantProvisions.$inferSelect;

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}


/** Site builder documents are owned by a team, never by a browser's localStorage. */
export const builderSites = pgTable('builder_sites', {
  id: uuid('id').primaryKey(),
  teamId: integer('team_id').notNull().references(() => teams.id),
  createdBy: integer('created_by').notNull().references(() => users.id),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  title: varchar('title', { length: 120 }).notNull(),
  draftDocument: jsonb('draft_document').notNull(),
  draftVersion: integer('draft_version').notNull().default(1),
  publishedDocument: jsonb('published_document'),
  publishedVersion: integer('published_version'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, table => [
  index('builder_sites_team_idx').on(table.teamId),
]);

/** Append-only audit trail: previous versions remain available after edits/publishing. */
export const builderSiteRevisions = pgTable('builder_site_revisions', {
  id: uuid('id').primaryKey(),
  siteId: uuid('site_id').notNull().references(() => builderSites.id),
  teamId: integer('team_id').notNull().references(() => teams.id),
  actorId: integer('actor_id').notNull().references(() => users.id),
  version: integer('version').notNull(),
  document: jsonb('document').notNull(),
  action: varchar('action', { length: 16 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, table => [
  uniqueIndex('builder_site_revisions_version_unique').on(table.siteId, table.version),
  index('builder_site_revisions_team_idx').on(table.teamId),
]);

export type BuilderSite = typeof builderSites.$inferSelect;

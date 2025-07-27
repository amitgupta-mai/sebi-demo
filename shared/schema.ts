import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  investorId: varchar("investor_id").unique(),
  kycStatus: boolean("kyc_status").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// NSE Listed Companies
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: varchar("symbol").notNull().unique(),
  name: varchar("name").notNull(),
  sector: varchar("sector"),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  marketCap: decimal("market_cap", { precision: 15, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Holdings (Real Shares)
export const holdings = pgTable("holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  quantity: integer("quantity").notNull(),
  averagePrice: decimal("average_price", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tokenized Shares
export const tokenizedShares = pgTable("tokenized_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  quantity: integer("quantity").notNull(),
  tokenizationPrice: decimal("tokenization_price", { precision: 10, scale: 2 }).notNull(),
  tokenizationDate: timestamp("tokenization_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order Types
export const orderTypeEnum = pgEnum('order_type', ['buy', 'sell']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'completed', 'cancelled']);

// Trading Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  orderType: orderTypeEnum("order_type").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transaction Types
export const transactionTypeEnum = pgEnum('transaction_type', ['tokenize', 'detokenize', 'trade_buy', 'trade_sell']);

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  fees: decimal("fees", { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  orderId: varchar("order_id").references(() => orders.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  holdings: many(holdings),
  tokenizedShares: many(tokenizedShares),
  orders: many(orders),
  transactions: many(transactions),
  wallet: one(wallets),
  walletTransactions: many(walletTransactions),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  holdings: many(holdings),
  tokenizedShares: many(tokenizedShares),
  orders: many(orders),
  transactions: many(transactions),
}));

export const holdingsRelations = relations(holdings, ({ one }) => ({
  user: one(users, {
    fields: [holdings.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [holdings.companyId],
    references: [companies.id],
  }),
}));

export const tokenizedSharesRelations = relations(tokenizedShares, ({ one }) => ({
  user: one(users, {
    fields: [tokenizedShares.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [tokenizedShares.companyId],
    references: [companies.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [orders.companyId],
    references: [companies.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [transactions.companyId],
    references: [companies.id],
  }),
  order: one(orders, {
    fields: [transactions.orderId],
    references: [orders.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHoldingSchema = createInsertSchema(holdings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTokenizedShareSchema = createInsertSchema(tokenizedShares).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Wallet tables
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull().default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const walletTransactionTypeEnum = pgEnum('wallet_transaction_type', ['add_fund', 'withdraw_fund', 'trading_debit', 'trading_credit']);
export const walletTransactionStatusEnum = pgEnum('wallet_transaction_status', ['pending', 'completed', 'failed']);

export const walletTransactions = pgTable("wallet_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  transactionType: walletTransactionTypeEnum("transaction_type").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: varchar("description"),
  status: walletTransactionStatusEnum("status").notNull().default('completed'),
  referenceId: varchar("reference_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Holding = typeof holdings.$inferSelect;
export type InsertHolding = z.infer<typeof insertHoldingSchema>;
export type TokenizedShare = typeof tokenizedShares.$inferSelect;
export type InsertTokenizedShare = z.infer<typeof insertTokenizedShareSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;

// Wallet Relations
export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(walletTransactions),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  user: one(users, {
    fields: [walletTransactions.userId],
    references: [users.id],
  }),
  wallet: one(wallets, {
    fields: [walletTransactions.userId],
    references: [wallets.userId],
  }),
}));

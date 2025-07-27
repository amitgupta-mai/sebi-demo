import {
  users,
  companies,
  holdings,
  tokenizedShares,
  orders,
  transactions,
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type Holding,
  type InsertHolding,
  type TokenizedShare,
  type InsertTokenizedShare,
  type Order,
  type InsertOrder,
  type Transaction,
  type InsertTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Company operations
  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyBySymbol(symbol: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompanyPrice(id: string, price: string): Promise<Company>;
  
  // Holdings operations
  getUserHoldings(userId: string): Promise<(Holding & { company: Company })[]>;
  getHolding(userId: string, companyId: string): Promise<Holding | undefined>;
  createHolding(holding: InsertHolding): Promise<Holding>;
  updateHolding(id: string, quantity: number, averagePrice: string): Promise<Holding>;
  
  // Tokenized shares operations
  getUserTokenizedShares(userId: string): Promise<(TokenizedShare & { company: Company })[]>;
  getTokenizedShare(userId: string, companyId: string): Promise<TokenizedShare | undefined>;
  createTokenizedShare(tokenizedShare: InsertTokenizedShare): Promise<TokenizedShare>;
  updateTokenizedShare(id: string, quantity: number): Promise<TokenizedShare>;
  
  // Order operations
  getUserOrders(userId: string): Promise<(Order & { company: Company })[]>;
  getActiveOrders(companyId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: 'pending' | 'completed' | 'cancelled'): Promise<Order>;
  
  // Transaction operations
  getUserTransactions(userId: string): Promise<(Transaction & { company: Company })[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Portfolio operations
  getUserPortfolioSummary(userId: string): Promise<{
    totalValue: number;
    realSharesValue: number;
    tokenizedSharesValue: number;
    totalHoldings: number;
    totalTokens: number;
    activeOrders: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        investorId: `INV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).where(eq(companies.isActive, true));
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyBySymbol(symbol: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.symbol, symbol));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompanyPrice(id: string, price: string): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set({ currentPrice: price, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  // Holdings operations
  async getUserHoldings(userId: string): Promise<(Holding & { company: Company })[]> {
    return await db
      .select()
      .from(holdings)
      .innerJoin(companies, eq(holdings.companyId, companies.id))
      .where(eq(holdings.userId, userId))
      .then(rows => rows.map(row => ({ ...row.holdings, company: row.companies })));
  }

  async getHolding(userId: string, companyId: string): Promise<Holding | undefined> {
    const [holding] = await db
      .select()
      .from(holdings)
      .where(and(eq(holdings.userId, userId), eq(holdings.companyId, companyId)));
    return holding;
  }

  async createHolding(holding: InsertHolding): Promise<Holding> {
    const [newHolding] = await db.insert(holdings).values(holding).returning();
    return newHolding;
  }

  async updateHolding(id: string, quantity: number, averagePrice: string): Promise<Holding> {
    const [holding] = await db
      .update(holdings)
      .set({ quantity, averagePrice, updatedAt: new Date() })
      .where(eq(holdings.id, id))
      .returning();
    return holding;
  }

  // Tokenized shares operations
  async getUserTokenizedShares(userId: string): Promise<(TokenizedShare & { company: Company })[]> {
    return await db
      .select()
      .from(tokenizedShares)
      .innerJoin(companies, eq(tokenizedShares.companyId, companies.id))
      .where(and(eq(tokenizedShares.userId, userId), eq(tokenizedShares.isActive, true)))
      .then(rows => rows.map(row => ({ ...row.tokenized_shares, company: row.companies })));
  }

  async getTokenizedShare(userId: string, companyId: string): Promise<TokenizedShare | undefined> {
    const [tokenizedShare] = await db
      .select()
      .from(tokenizedShares)
      .where(and(
        eq(tokenizedShares.userId, userId),
        eq(tokenizedShares.companyId, companyId),
        eq(tokenizedShares.isActive, true)
      ));
    return tokenizedShare;
  }

  async createTokenizedShare(tokenizedShare: InsertTokenizedShare): Promise<TokenizedShare> {
    const [newTokenizedShare] = await db.insert(tokenizedShares).values(tokenizedShare).returning();
    return newTokenizedShare;
  }

  async updateTokenizedShare(id: string, quantity: number): Promise<TokenizedShare> {
    const [tokenizedShare] = await db
      .update(tokenizedShares)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(tokenizedShares.id, id))
      .returning();
    return tokenizedShare;
  }

  // Order operations
  async getUserOrders(userId: string): Promise<(Order & { company: Company })[]> {
    return await db
      .select()
      .from(orders)
      .innerJoin(companies, eq(orders.companyId, companies.id))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .then(rows => rows.map(row => ({ ...row.orders, company: row.companies })));
  }

  async getActiveOrders(companyId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(and(eq(orders.companyId, companyId), eq(orders.status, 'pending')))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: string, status: 'pending' | 'completed' | 'cancelled'): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Transaction operations
  async getUserTransactions(userId: string): Promise<(Transaction & { company: Company })[]> {
    return await db
      .select()
      .from(transactions)
      .innerJoin(companies, eq(transactions.companyId, companies.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .then(rows => rows.map(row => ({ ...row.transactions, company: row.companies })));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  // Portfolio operations
  async getUserPortfolioSummary(userId: string): Promise<{
    totalValue: number;
    realSharesValue: number;
    tokenizedSharesValue: number;
    totalHoldings: number;
    totalTokens: number;
    activeOrders: number;
  }> {
    const userHoldings = await this.getUserHoldings(userId);
    const userTokens = await this.getUserTokenizedShares(userId);
    const userOrders = await this.getUserOrders(userId);

    const realSharesValue = userHoldings.reduce((sum, holding) => {
      return sum + (holding.quantity * parseFloat(holding.company.currentPrice));
    }, 0);

    const tokenizedSharesValue = userTokens.reduce((sum, token) => {
      return sum + (token.quantity * parseFloat(token.company.currentPrice));
    }, 0);

    const activeOrders = userOrders.filter(order => order.status === 'pending').length;

    return {
      totalValue: realSharesValue + tokenizedSharesValue,
      realSharesValue,
      tokenizedSharesValue,
      totalHoldings: userHoldings.length,
      totalTokens: userTokens.length,
      activeOrders,
    };
  }
}

export const storage = new DatabaseStorage();

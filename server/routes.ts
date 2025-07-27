import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertCompanySchema,
  insertHoldingSchema,
  insertTokenizedShareSchema,
  insertOrderSchema,
  insertTransactionSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Company routes
  app.get('/api/companies', isAuthenticated, async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get('/api/companies/:id', isAuthenticated, async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post('/api/companies', isAuthenticated, async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(400).json({ message: "Invalid company data" });
    }
  });

  // Holdings routes
  app.get('/api/holdings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const holdings = await storage.getUserHoldings(userId);
      res.json(holdings);
    } catch (error) {
      console.error("Error fetching holdings:", error);
      res.status(500).json({ message: "Failed to fetch holdings" });
    }
  });

  app.post('/api/holdings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const holdingData = insertHoldingSchema.parse({ ...req.body, userId });
      const holding = await storage.createHolding(holdingData);
      res.json(holding);
    } catch (error) {
      console.error("Error creating holding:", error);
      res.status(400).json({ message: "Invalid holding data" });
    }
  });

  // Tokenized shares routes
  app.get('/api/tokenized-shares', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tokenizedShares = await storage.getUserTokenizedShares(userId);
      res.json(tokenizedShares);
    } catch (error) {
      console.error("Error fetching tokenized shares:", error);
      res.status(500).json({ message: "Failed to fetch tokenized shares" });
    }
  });

  // Tokenize shares endpoint
  app.post('/api/tokenize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { companyId, quantity, price } = req.body;

      // Validate input
      const schema = z.object({
        companyId: z.string(),
        quantity: z.number().positive(),
        price: z.string(),
      });
      const validatedData = schema.parse({ companyId, quantity, price });

      // Check if user has enough real shares
      const holding = await storage.getHolding(userId, validatedData.companyId);
      if (!holding || holding.quantity < validatedData.quantity) {
        return res.status(400).json({ message: "Insufficient shares to tokenize" });
      }

      // Create tokenized shares
      const tokenizedShare = await storage.createTokenizedShare({
        userId,
        companyId: validatedData.companyId,
        quantity: validatedData.quantity,
        tokenizationPrice: validatedData.price,
      });

      // Update real holdings
      const newQuantity = holding.quantity - validatedData.quantity;
      if (newQuantity > 0) {
        await storage.updateHolding(holding.id, newQuantity, holding.averagePrice);
      }

      // Create transaction record
      await storage.createTransaction({
        userId,
        companyId: validatedData.companyId,
        transactionType: 'tokenize',
        quantity: validatedData.quantity,
        price: validatedData.price,
        fees: '50.00', // Fixed tokenization fee
        totalAmount: (parseFloat(validatedData.price) * validatedData.quantity + 50).toString(),
      });

      res.json(tokenizedShare);
    } catch (error) {
      console.error("Error tokenizing shares:", error);
      res.status(400).json({ message: "Failed to tokenize shares" });
    }
  });

  // Convert tokens back to shares endpoint
  app.post('/api/convert-to-shares', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { companyId, quantity, price } = req.body;

      // Validate input
      const schema = z.object({
        companyId: z.string(),
        quantity: z.number().positive(),
        price: z.string(),
      });
      const validatedData = schema.parse({ companyId, quantity, price });

      // Check if user has enough tokens
      const tokenizedShare = await storage.getTokenizedShare(userId, validatedData.companyId);
      if (!tokenizedShare || tokenizedShare.quantity < validatedData.quantity) {
        return res.status(400).json({ message: "Insufficient tokens to convert" });
      }

      // Update tokenized shares
      const newTokenQuantity = tokenizedShare.quantity - validatedData.quantity;
      await storage.updateTokenizedShare(tokenizedShare.id, newTokenQuantity);

      // Create or update real holdings
      const existingHolding = await storage.getHolding(userId, validatedData.companyId);
      if (existingHolding) {
        const newQuantity = existingHolding.quantity + validatedData.quantity;
        const weightedAveragePrice = (
          (existingHolding.quantity * parseFloat(existingHolding.averagePrice)) +
          (validatedData.quantity * parseFloat(validatedData.price))
        ) / newQuantity;
        await storage.updateHolding(existingHolding.id, newQuantity, weightedAveragePrice.toString());
      } else {
        await storage.createHolding({
          userId,
          companyId: validatedData.companyId,
          quantity: validatedData.quantity,
          averagePrice: validatedData.price,
        });
      }

      // Create transaction record
      await storage.createTransaction({
        userId,
        companyId: validatedData.companyId,
        transactionType: 'detokenize',
        quantity: validatedData.quantity,
        price: validatedData.price,
        fees: '25.00', // Fixed conversion fee
        totalAmount: (parseFloat(validatedData.price) * validatedData.quantity - 25).toString(),
      });

      res.json({ message: "Successfully converted tokens to shares" });
    } catch (error) {
      console.error("Error converting tokens:", error);
      res.status(400).json({ message: "Failed to convert tokens" });
    }
  });

  // Orders routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderData = insertOrderSchema.parse({ ...req.body, userId });
      
      // For sell orders, check if user has enough tokens
      if (orderData.orderType === 'sell') {
        const tokenizedShare = await storage.getTokenizedShare(userId, orderData.companyId);
        if (!tokenizedShare || tokenizedShare.quantity < orderData.quantity) {
          return res.status(400).json({ message: "Insufficient tokens to sell" });
        }
      }

      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  // Transactions routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Portfolio summary route
  app.get('/api/portfolio/summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const summary = await storage.getUserPortfolioSummary(userId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching portfolio summary:", error);
      res.status(500).json({ message: "Failed to fetch portfolio summary" });
    }
  });

  // Initialize sample data endpoint (for development)
  app.post('/api/init-data', isAuthenticated, async (req, res) => {
    try {
      // Create sample NSE companies
      const companies = [
        { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', sector: 'Information Technology', currentPrice: '3456.80' },
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Oil & Gas', currentPrice: '2845.30' },
        { symbol: 'INFY', name: 'Infosys Ltd', sector: 'Information Technology', currentPrice: '1678.90' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking', currentPrice: '1587.45' },
        { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking', currentPrice: '934.20' },
      ];

      for (const companyData of companies) {
        const existingCompany = await storage.getCompanyBySymbol(companyData.symbol);
        if (!existingCompany) {
          await storage.createCompany(companyData);
        }
      }

      res.json({ message: 'Sample data initialized successfully' });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

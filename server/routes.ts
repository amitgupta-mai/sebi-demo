import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCompanySchema,
  insertHoldingSchema,
  insertTokenizedShareSchema,
  insertOrderSchema,
  insertTransactionSchema 
} from "@shared/schema";
import { z } from "zod";

// Demo user ID for all operations (since no auth)
const DEMO_USER_ID = "demo-user-123";

export async function registerRoutes(app: Express): Promise<Server> {
  // Demo user endpoint (replaces auth user)
  app.get('/api/auth/user', async (req, res) => {
    try {
      // Return demo user data
      const demoUser = {
        id: DEMO_USER_ID,
        email: "demo@investor.com",
        firstName: "Demo",
        lastName: "Investor",
        profileImageUrl: null,
        investorId: "INV-DEMO-001",
        kycStatus: "verified",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      res.json(demoUser);
    } catch (error) {
      console.error("Error fetching demo user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Company routes
  app.get('/api/companies', async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get('/api/companies/:id', async (req, res) => {
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

  app.post('/api/companies', async (req, res) => {
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
  app.get('/api/holdings', async (req, res) => {
    try {
      const holdings = await storage.getUserHoldings(DEMO_USER_ID);
      res.json(holdings);
    } catch (error) {
      console.error("Error fetching holdings:", error);
      res.status(500).json({ message: "Failed to fetch holdings" });
    }
  });

  app.post('/api/holdings', async (req, res) => {
    try {
      const holdingData = insertHoldingSchema.parse({ ...req.body, userId: DEMO_USER_ID });
      const holding = await storage.createHolding(holdingData);
      res.json(holding);
    } catch (error) {
      console.error("Error creating holding:", error);
      res.status(400).json({ message: "Invalid holding data" });
    }
  });

  // Tokenized shares routes
  app.get('/api/tokenized-shares', async (req, res) => {
    try {
      const tokenizedShares = await storage.getUserTokenizedShares(DEMO_USER_ID);
      res.json(tokenizedShares);
    } catch (error) {
      console.error("Error fetching tokenized shares:", error);
      res.status(500).json({ message: "Failed to fetch tokenized shares" });
    }
  });

  // Tokenize shares endpoint
  app.post('/api/tokenize', async (req, res) => {
    try {
      const userId = DEMO_USER_ID;
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
  app.post('/api/convert-to-shares', async (req, res) => {
    try {
      const userId = DEMO_USER_ID;
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
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await storage.getUserOrders(DEMO_USER_ID);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse({ ...req.body, userId: DEMO_USER_ID });
      
      // For sell orders, check if user has enough tokens
      if (orderData.orderType === 'sell') {
        const tokenizedShare = await storage.getTokenizedShare(DEMO_USER_ID, orderData.companyId);
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
  app.get('/api/transactions', async (req, res) => {
    try {
      const transactions = await storage.getUserTransactions(DEMO_USER_ID);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Portfolio summary route
  app.get('/api/portfolio/summary', async (req, res) => {
    try {
      const summary = await storage.getUserPortfolioSummary(DEMO_USER_ID);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching portfolio summary:", error);
      res.status(500).json({ message: "Failed to fetch portfolio summary" });
    }
  });

  // Initialize sample data endpoint (for development)
  app.post('/api/init-data', async (req, res) => {
    try {
      // Create demo user if not exists
      const existingUser = await storage.getUser(DEMO_USER_ID);
      if (!existingUser) {
        await storage.upsertUser({
          id: DEMO_USER_ID,
          email: "demo@investor.com",
          firstName: "Demo",
          lastName: "Investor",
          profileImageUrl: null,
        });
      }

      // Create sample NSE companies
      const companies = [
        { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', sector: 'Information Technology', currentPrice: '3456.80' },
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Oil & Gas', currentPrice: '2845.30' },
        { symbol: 'INFY', name: 'Infosys Ltd', sector: 'Information Technology', currentPrice: '1678.90' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking', currentPrice: '1587.45' },
        { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking', currentPrice: '934.20' },
      ];

      const createdCompanies = [];
      for (const companyData of companies) {
        const existingCompany = await storage.getCompanyBySymbol(companyData.symbol);
        if (!existingCompany) {
          const company = await storage.createCompany(companyData);
          createdCompanies.push(company);
        } else {
          createdCompanies.push(existingCompany);
        }
      }

      // Create sample holdings for demo user
      const existingHoldings = await storage.getUserHoldings(DEMO_USER_ID);
      if (existingHoldings.length === 0) {
        // Add some sample holdings
        const sampleHoldings = [
          { userId: DEMO_USER_ID, companyId: createdCompanies[0].id, quantity: 50, averagePrice: '3400.00' },
          { userId: DEMO_USER_ID, companyId: createdCompanies[1].id, quantity: 25, averagePrice: '2800.00' },
          { userId: DEMO_USER_ID, companyId: createdCompanies[2].id, quantity: 75, averagePrice: '1650.00' },
        ];

        for (const holdingData of sampleHoldings) {
          await storage.createHolding(holdingData);
        }

        // Add some sample tokenized shares
        const sampleTokenizedShares = [
          { userId: DEMO_USER_ID, companyId: createdCompanies[3].id, quantity: 30, tokenizationPrice: '1580.00' },
          { userId: DEMO_USER_ID, companyId: createdCompanies[4].id, quantity: 40, tokenizationPrice: '920.00' },
        ];

        for (const tokenData of sampleTokenizedShares) {
          await storage.createTokenizedShare(tokenData);
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

// Mock data for the frontend-only version
export const mockCompanies = [
  {
    id: '1',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    sector: 'Oil & Gas',
    currentPrice: '2500.00',
    marketCap: '1680000.00',
    isActive: true,
    createdAt: '2025-07-30T12:26:08.938Z',
    updatedAt: '2025-07-30T12:26:08.938Z',
  },
  {
    id: '2',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Limited',
    sector: 'Information Technology',
    currentPrice: '3800.00',
    marketCap: '1400000.00',
    isActive: true,
    createdAt: '2025-07-30T12:26:08.962Z',
    updatedAt: '2025-07-30T12:26:08.962Z',
  },
  {
    id: '3',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    sector: 'Banking',
    currentPrice: '1650.00',
    marketCap: '950000.00',
    isActive: true,
    createdAt: '2025-07-30T12:26:08.963Z',
    updatedAt: '2025-07-30T12:26:08.963Z',
  },
  {
    id: '4',
    symbol: 'INFY',
    name: 'Infosys Limited',
    sector: 'Information Technology',
    currentPrice: '1450.00',
    marketCap: '600000.00',
    isActive: true,
    createdAt: '2025-07-30T12:26:08.964Z',
    updatedAt: '2025-07-30T12:26:08.964Z',
  },
  {
    id: '5',
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    sector: 'Banking',
    currentPrice: '950.00',
    marketCap: '650000.00',
    isActive: true,
    createdAt: '2025-07-30T12:26:08.965Z',
    updatedAt: '2025-07-30T12:26:08.965Z',
  },
];

export const mockUser = {
  id: 'demo-user-123',
  email: 'demo@investor.com',
  firstName: 'Demo',
  lastName: 'Investor',
  profileImageUrl: null,
  investorId: 'INV-DEMO-001',
  kycStatus: 'verified',
  createdAt: '2025-07-30T06:57:05.758Z',
  updatedAt: '2025-07-30T06:57:05.758Z',
};

export const mockHoldings = [
  {
    id: '1',
    userId: 'user-' + Date.now(),
    companyId: '1',
    quantity: 100,
    averagePrice: '2400.00',
    purchaseDate: '2025-01-15T00:00:00.000Z',
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z',
    company: mockCompanies[0],
  },
  {
    id: '2',
    userId: 'user-' + Date.now(),
    companyId: '2',
    quantity: 50,
    averagePrice: '3600.00',
    purchaseDate: '2025-02-20T00:00:00.000Z',
    createdAt: '2025-02-20T00:00:00.000Z',
    updatedAt: '2025-02-20T00:00:00.000Z',
    company: mockCompanies[1],
  },
];

export const mockTokenizedShares = [
  {
    id: '1',
    userId: 'user-' + Date.now(),
    companyId: '3',
    quantity: 200,
    tokenizationPrice: '1600.00',
    tokenizationDate: '2025-03-10T00:00:00.000Z',
    isActive: true,
    createdAt: '2025-03-10T00:00:00.000Z',
    updatedAt: '2025-03-10T00:00:00.000Z',
    company: mockCompanies[2],
  },
];

export const mockOrders = [
  {
    id: '1',
    userId: 'user-' + Date.now(),
    companyId: '4',
    orderType: 'buy',
    quantity: 25,
    price: '1500.00',
    status: 'pending',
    createdAt: '2025-07-30T10:00:00.000Z',
    updatedAt: '2025-07-30T10:00:00.000Z',
    company: mockCompanies[3],
  },
];

export const mockTransactions = [
  {
    id: '1',
    userId: 'user-' + Date.now(),
    companyId: '1',
    transactionType: 'tokenize',
    quantity: 50,
    price: '2500.00',
    totalAmount: '125000.00',
    createdAt: '2025-07-30T09:00:00.000Z',
    company: mockCompanies[0],
  },
];

export const mockWallet = {
  id: '1',
  userId: 'user-' + Date.now(),
  balance: '50000.00',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-07-30T12:00:00.000Z',
};

export const mockWalletTransactions = [
  {
    id: '1',
    walletId: '1',
    transactionType: 'deposit',
    amount: '10000.00',
    description: 'Initial deposit',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    walletId: '1',
    transactionType: 'withdrawal',
    amount: '5000.00',
    description: 'Tokenization fee',
    createdAt: '2025-07-30T09:00:00.000Z',
  },
];

export const mockPortfolioSummary = {
  totalValue: 1250000,
  realSharesValue: 750000,
  tokenizedSharesValue: 500000,
  totalHoldings: 2,
  totalTokens: 1,
  activeOrders: 1,
};

export const mockMarketData = {
  totalVolume: 1500000000,
  activeTrades: 1250,
  marketTrend: 'bullish',
  topGainers: mockCompanies.slice(0, 3),
  topLosers: mockCompanies.slice(3, 5),
};

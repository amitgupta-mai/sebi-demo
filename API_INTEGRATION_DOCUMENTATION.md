# SEBI POC Backend API Integration Documentation

## 📋 Table of Contents
1. [Base Configuration](#base-configuration)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Wallet Management](#wallet-management)
5. [Market Data](#market-data)
6. [Shares Management](#shares-management)
7. [Token Trading](#token-trading)
8. [Portfolio Management](#portfolio-management)
9. [Transaction History](#transaction-history)
10. [Error Handling](#error-handling)
11. [Integration Examples](#integration-examples)

---

## 🔧 Base Configuration

### Base URL
```
Development: http://localhost:3000
Production: https://your-production-domain.com
```

### Headers
```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}` // For authenticated requests
};
```

---

## 🔐 Authentication

### 1. User Registration
```javascript
// POST /api/auth/signup
const signupData = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  password: "SecurePass123!"
};

const response = await fetch(`${baseUrl}/api/auth/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(signupData)
});

// Response
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "id": "user-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "isEmailVerified": false
  }
}
```

### 2. Email Verification
```javascript
// POST /api/auth/verify-email
const verifyData = {
  otp: "123456",
  email: "john.doe@example.com"
};

const response = await fetch(`${baseUrl}/api/auth/verify-email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(verifyData)
});

// Response (includes tokens for immediate access)
{
  "success": true,
  "message": "Email verified successfully. Welcome to the platform!",
  "data": {
    "user": {
      "id": "user-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "isEmailVerified": true,
      "walletAddress": "0x1234567890abcdef...",
      "wallet": {
        "address": "0x1234567890abcdef...",
        "balance": "0",
        "network": "TESTNET",
        "blockchain": "KALP"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "15m"
    }
  }
}
```

### 3. User Login
```javascript
// POST /api/auth/login
const loginData = {
  email: "john.doe@example.com",
  password: "SecurePass123!"
};

const response = await fetch(`${baseUrl}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginData)
});

// Success Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "isEmailVerified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "15m"
    }
  }
}

// Unverified Email Response
{
  "success": true,
  "message": "Email verification required",
  "data": {
    "requiresVerification": true,
    "message": "Please verify your email before logging in",
    "user": {
      "id": "user-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "isEmailVerified": false
    }
  }
}
```

### 4. Send Verification OTP for Login
```javascript
// POST /api/auth/send-verification-otp
const otpData = {
  email: "john.doe@example.com"
};

const response = await fetch(`${baseUrl}/api/auth/send-verification-otp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(otpData)
});
```

### 5. Refresh Token
```javascript
// POST /api/auth/refresh-token
const refreshData = {
  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
};

const response = await fetch(`${baseUrl}/api/auth/refresh-token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(refreshData)
});

// Response
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "new-access-token",
      "refreshToken": "new-refresh-token",
      "expiresIn": "15m"
    }
  }
}
```

### 6. Logout
```javascript
// POST /api/auth/logout
const response = await fetch(`${baseUrl}/api/auth/logout`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 7. Get Current User
```javascript
// GET /api/auth/me
const response = await fetch(`${baseUrl}/api/auth/me`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Response
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "user-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "isEmailVerified": true,
    "walletAddress": "0x1234567890abcdef...",
    "createdAt": "2025-07-31T06:46:52.588Z",
    "updatedAt": "2025-07-31T06:46:52.588Z"
  }
}
```

---

## 👤 User Management

### 1. Get All Users (Admin)
```javascript
// GET /api/users
const response = await fetch(`${baseUrl}/api/users`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Response
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "user-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "isEmailVerified": true,
      "walletAddress": "0x1234567890abcdef...",
      "createdAt": "2025-07-31T06:46:52.588Z",
      "updatedAt": "2025-07-31T06:46:52.588Z"
    }
  ]
}
```

### 2. Search Users
```javascript
// GET /api/users/search?q=john
const response = await fetch(`${baseUrl}/api/users/search?q=john`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 3. Update User Profile
```javascript
// PUT /api/users/profile
const updateData = {
  firstName: "John",
  lastName: "Smith",
  email: "john.smith@example.com"
};

const response = await fetch(`${baseUrl}/api/users/profile`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(updateData)
});
```

---

## 💰 Wallet Management

### 1. Get User Wallet
```javascript
// GET /api/wallet
const response = await fetch(`${baseUrl}/api/wallet`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Response
{
  "success": true,
  "message": "Wallet retrieved successfully",
  "data": {
    "id": "wallet-id",
    "userId": "user-id",
    "balance": 10000.00,
    "totalAdded": 15000.00,
    "totalWithdrawn": 5000.00,
    "cbdcBalance": 0.00,
    "cbdcConnected": false,
    "cbdcWalletAddress": null,
    "totalBalance": 10000.00,
    "createdAt": "2025-07-31T06:46:52.588Z",
    "updatedAt": "2025-07-31T06:46:52.588Z"
  }
}
```

### 2. Add Funds to Wallet
```javascript
// POST /api/wallet/add-funds
const addFundsData = {
  amount: 5000.00
};

const response = await fetch(`${baseUrl}/api/wallet/add-funds`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(addFundsData)
});

// Response
{
  "success": true,
  "message": "Funds added successfully",
  "data": {
    "id": "wallet-id",
    "userId": "user-id",
    "balance": 15000.00,
    "totalAdded": 20000.00,
    "totalWithdrawn": 5000.00,
    "cbdcBalance": 0.00,
    "cbdcConnected": false,
    "cbdcWalletAddress": null,
    "totalBalance": 15000.00
  }
}
```

### 3. Withdraw Funds from Wallet
```javascript
// POST /api/wallet/withdraw-funds
const withdrawData = {
  amount: 2000.00
};

const response = await fetch(`${baseUrl}/api/wallet/withdraw-funds`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(withdrawData)
});
```

### 4. Connect CBDC Wallet
```javascript
// POST /api/wallet/connect-cbdc
const cbdcData = {
  walletAddress: "cbdc_wallet_address_here"
};

const response = await fetch(`${baseUrl}/api/wallet/connect-cbdc`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(cbdcData)
});
```

### 5. Update CBDC Balance
```javascript
// PATCH /api/wallet/update-cbdc-balance
const balanceData = {
  balance: 1000.00
};

const response = await fetch(`${baseUrl}/api/wallet/update-cbdc-balance`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(balanceData)
});
```

### 6. Get Wallet Balance
```javascript
// GET /api/wallet/balance
const response = await fetch(`${baseUrl}/api/wallet/balance`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Response
{
  "success": true,
  "message": "Wallet balance retrieved successfully",
  "data": {
    "totalBalance": 15000.00,
    "regularBalance": 14000.00,
    "cbdcBalance": 1000.00,
    "cbdcConnected": true
  }
}
```

### 7. Close Wallet (Paytm-like)
```javascript
// DELETE /api/wallet
const response = await fetch(`${baseUrl}/api/wallet`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Response (with balance)
{
  "success": true,
  "message": "Wallet closed successfully",
  "data": {
    "message": "Wallet closed successfully. Refund will be processed within 3-5 business days.",
    "refundAmount": 15000.00,
    "walletClosed": true
  }
}

// Response (no balance)
{
  "success": true,
  "message": "Wallet closed successfully",
  "data": {
    "message": "Wallet closed successfully",
    "walletClosed": true
  }
}
```

---

## 📊 Market Data

### 1. Get All Companies
```javascript
// GET /api/market/companies
const response = await fetch(`${baseUrl}/api/market/companies`, {
  method: 'GET'
});

// Response
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": {
    "companies": [
      {
        "id": "company-id",
        "symbol": "TCS",
        "name": "Tata Consultancy Services",
        "exchange": "NSE",
        "sector": "Technology",
        "marketCap": 1500000000000,
        "currentPrice": 3456.80,
        "previousClose": 3400.00,
        "changePercentage": 1.67,
        "volume": 2500000,
        "isActive": true,
        "createdAt": "2025-07-31T06:46:52.588Z",
        "updatedAt": "2025-07-31T06:46:52.588Z"
      }
    ],
    "total": 30
  }
}
```

### 2. Get Company by ID
```javascript
// GET /api/market/companies/:id
const response = await fetch(`${baseUrl}/api/market/companies/company-id`, {
  method: 'GET'
});
```

### 3. Get Company by Symbol
```javascript
// GET /api/market/companies/symbol/TCS
const response = await fetch(`${baseUrl}/api/market/companies/symbol/TCS`, {
  method: 'GET'
});
```

### 4. Search Companies
```javascript
// GET /api/market/companies/search?q=TCS
const response = await fetch(`${baseUrl}/api/market/companies/search?q=TCS`, {
  method: 'GET'
});
```

### 5. Get Market Overview
```javascript
// GET /api/market/overview
const response = await fetch(`${baseUrl}/api/market/overview`, {
  method: 'GET'
});

// Response
{
  "success": true,
  "message": "Market overview retrieved successfully",
  "data": {
    "totalCompanies": 30,
    "totalMarketCap": 45000000000000,
    "topGainers": [...],
    "topLosers": [...],
    "mostActive": [...]
  }
}
```

---

## 📈 Shares Management

### 1. Get User Shares
```javascript
// GET /api/shares
const response = await fetch(`${baseUrl}/api/shares`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Response
{
  "success": true,
  "message": "Shares retrieved successfully",
  "data": [
    {
      "id": "share-id",
      "userId": "user-id",
      "companyId": "company-id",
      "quantity": 100,
      "averagePrice": 3400.00,
      "currentPrice": 3456.80,
      "totalValue": 345680.00,
      "profitLoss": 5680.00,
      "profitLossPercentage": 1.67,
      "isTokenized": false,
      "company": {
        "symbol": "TCS",
        "name": "Tata Consultancy Services"
      }
    }
  ]
}
```

### 2. Get Share by ID
```javascript
// GET /api/shares/:id
const response = await fetch(`${baseUrl}/api/shares/share-id`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 3. Buy Shares
```javascript
// POST /api/shares/buy
const buyData = {
  companyId: "company-id",
  quantity: 10
};

const response = await fetch(`${baseUrl}/api/shares/buy`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(buyData)
});
```

### 4. Sell Shares
```javascript
// POST /api/shares/sell
const sellData = {
  shareId: "share-id",
  quantity: 5
};

const response = await fetch(`${baseUrl}/api/shares/sell`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(sellData)
});
```

### 5. Tokenize Shares
```javascript
// POST /api/shares/tokenize
const tokenizeData = {
  shareId: "share-id"
};

const response = await fetch(`${baseUrl}/api/shares/tokenize`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(tokenizeData)
});
```

### 6. Get Non-Tokenized Shares
```javascript
// GET /api/shares/non-tokenized
const response = await fetch(`${baseUrl}/api/shares/non-tokenized`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## 🪙 Token Trading

### 1. Get Available Tokens
```javascript
// GET /api/tokens/available
const response = await fetch(`${baseUrl}/api/tokens/available`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Response
{
  "success": true,
  "message": "Available tokens retrieved successfully",
  "data": [
    {
      "id": "token-id",
      "userId": "user-id",
      "companyId": "company-id",
      "quantity": 50,
      "averagePrice": 3400.00,
      "currentPrice": 3456.80,
      "totalValue": 172840.00,
      "profitLoss": 2840.00,
      "profitLossPercentage": 1.67,
      "tokenId": "TOKEN_TCS_001",
      "isConverted": false,
      "company": {
        "symbol": "TCS",
        "name": "Tata Consultancy Services"
      }
    }
  ]
}
```

### 2. Buy Tokens
```javascript
// POST /api/tokens/buy
const buyTokenData = {
  companyId: "company-id",
  quantity: 10,
  pricePerToken: 3456.80
};

const response = await fetch(`${baseUrl}/api/tokens/buy`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(buyTokenData)
});
```

### 3. Sell Tokens
```javascript
// POST /api/tokens/sell
const sellTokenData = {
  tokenId: "token-id",
  quantity: 5,
  pricePerToken: 3500.00
};

const response = await fetch(`${baseUrl}/api/tokens/sell`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(sellTokenData)
});
```

### 4. Get Available Tokens for Conversion
```javascript
// GET /api/tokens/available-for-conversion
const response = await fetch(`${baseUrl}/api/tokens/available-for-conversion`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 5. Convert Tokens to Shares
```javascript
// POST /api/tokens/convert-to-shares
const convertData = {
  tokenId: "token-id",
  quantity: 10
};

const response = await fetch(`${baseUrl}/api/tokens/convert-to-shares`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(convertData)
});
```

### 6. Get Trading Orders
```javascript
// GET /api/tokens/orders
const response = await fetch(`${baseUrl}/api/tokens/orders`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## 📊 Portfolio Management

### 1. Get Portfolio Overview
```javascript
// GET /api/portfolio/overview
const response = await fetch(`${baseUrl}/api/portfolio/overview`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Response
{
  "success": true,
  "message": "Portfolio overview retrieved successfully",
  "data": {
    "totalValue": 518520.00,
    "totalInvested": 500000.00,
    "totalProfitLoss": 18520.00,
    "profitLossPercentage": 3.70,
    "totalShares": 150,
    "totalTokens": 50,
    "topHoldings": [...],
    "recentTransactions": [...]
  }
}
```

### 2. Get Holdings
```javascript
// GET /api/portfolio/holdings
const response = await fetch(`${baseUrl}/api/portfolio/holdings`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Response
{
  "success": true,
  "message": "Holdings retrieved successfully",
  "data": {
    "shares": [...],
    "tokens": [...],
    "summary": {
      "totalSharesValue": 345680.00,
      "totalTokensValue": 172840.00,
      "totalValue": 518520.00
    }
  }
}
```

### 3. Get Portfolio Performance
```javascript
// GET /api/portfolio/performance?period=1M
const response = await fetch(`${baseUrl}/api/portfolio/performance?period=1M`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Response
{
  "success": true,
  "message": "Portfolio performance retrieved successfully",
  "data": {
    "period": "1M",
    "startValue": 500000.00,
    "endValue": 518520.00,
    "change": 18520.00,
    "changePercentage": 3.70,
    "dailyReturns": [...],
    "bestPerforming": "TCS",
    "worstPerforming": "INFY"
  }
}
```

### 4. Get Portfolio by Company
```javascript
// GET /api/portfolio/company/:companyId
const response = await fetch(`${baseUrl}/api/portfolio/company/company-id`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Response
{
  "success": true,
  "message": "Company portfolio retrieved successfully",
  "data": {
    "company": {
      "symbol": "TCS",
      "name": "Tata Consultancy Services"
    },
    "shares": {
      "quantity": 100,
      "averagePrice": 3400.00,
      "currentPrice": 3456.80,
      "totalValue": 345680.00,
      "profitLoss": 5680.00,
      "profitLossPercentage": 1.67
    },
    "tokens": {
      "quantity": 50,
      "averagePrice": 3400.00,
      "currentPrice": 3456.80,
      "totalValue": 172840.00,
      "profitLoss": 2840.00,
      "profitLossPercentage": 1.67
    },
    "totalValue": 518520.00,
    "totalProfitLoss": 8520.00,
    "totalProfitLossPercentage": 1.67
  }
}
```

---

## 📋 Transaction History

### 1. Get All Transactions
```javascript
// GET /api/transactions
const response = await fetch(`${baseUrl}/api/transactions`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Response
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": "transaction-id",
      "userId": "user-id",
      "companyId": "company-id",
      "transactionType": "buy",
      "status": "completed",
      "quantity": 10,
      "pricePerUnit": 3456.80,
      "totalAmount": 34568.00,
      "fees": 100.00,
      "netAmount": 34468.00,
      "transactionId": "TXN_001",
      "description": "Buy transaction for TCS shares",
      "metadata": {},
      "company": {
        "symbol": "TCS",
        "name": "Tata Consultancy Services"
      },
      "createdAt": "2025-07-31T06:46:52.588Z",
      "updatedAt": "2025-07-31T06:46:52.588Z"
    }
  ]
}
```

### 2. Get Transactions by Type
```javascript
// GET /api/transactions/type/buy
const response = await fetch(`${baseUrl}/api/transactions/type/buy`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 3. Get Transactions by Status
```javascript
// GET /api/transactions/status/completed
const response = await fetch(`${baseUrl}/api/transactions/status/completed`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 4. Search Transactions
```javascript
// GET /api/transactions/search?q=TCS
const response = await fetch(`${baseUrl}/api/transactions/search?q=TCS`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### 5. Get Transaction Statistics
```javascript
// GET /api/transactions/stats
const response = await fetch(`${baseUrl}/api/transactions/stats`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Response
{
  "success": true,
  "message": "Transaction statistics retrieved successfully",
  "data": {
    "totalTransactions": 25,
    "totalBuyTransactions": 15,
    "totalSellTransactions": 8,
    "totalTokenizationTransactions": 2,
    "totalAmount": 500000.00,
    "totalFees": 2500.00,
    "monthlyStats": [...],
    "topCompanies": [...]
  }
}
```

---

## ❌ Error Handling

### Common Error Responses

#### 1. Authentication Errors
```javascript
// 401 Unauthorized
{
  "success": false,
  "message": "Access token is required",
  "errorCode": 1001,
  "timestamp": "2025-07-31T06:46:52.588Z"
}

// 401 Unauthorized - Invalid Token
{
  "success": false,
  "message": "Invalid or expired access token",
  "errorCode": 1002,
  "timestamp": "2025-07-31T06:46:52.588Z"
}
```

#### 2. Validation Errors
```javascript
// 400 Bad Request
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "timestamp": "2025-07-31T06:46:52.588Z"
}
```

#### 3. Not Found Errors
```javascript
// 404 Not Found
{
  "success": false,
  "message": "User not found",
  "errorCode": 1003,
  "timestamp": "2025-07-31T06:46:52.588Z"
}
```

#### 4. Business Logic Errors
```javascript
// 400 Bad Request - Insufficient Funds
{
  "success": false,
  "message": "Insufficient funds in wallet",
  "errorCode": 1007,
  "timestamp": "2025-07-31T06:46:52.588Z"
}

// 400 Bad Request - Email Already Exists
{
  "success": false,
  "message": "Email already exists",
  "errorCode": 1004,
  "timestamp": "2025-07-31T06:46:52.588Z"
}
```

### Error Codes Reference
```javascript
const ERROR_CODES = {
  TOKEN_REQUIRED: 1001,
  INVALID_TOKEN: 1002,
  USER_NOT_FOUND: 1003,
  EMAIL_ALREADY_EXISTS: 1004,
  INVALID_CREDENTIALS: 1005,
  COMPANY_ALREADY_EXISTS: 1006,
  INSUFFICIENT_FUNDS: 1007,
  INVALID_VERIFICATION_OTP: 1009,
  VERIFICATION_OTP_EXPIRED: 1011,
  OTP_REQUIRED: 1012
};
```

---

## 🔧 Integration Examples

### 1. Complete Authentication Flow
```javascript
class AuthService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async signup(userData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Show email verification screen
        return { success: true, message: result.message, user: result.data };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(otp, email) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, email })
      });

      const result = await response.json();
      
      if (result.success) {
        // Store tokens
        localStorage.setItem('accessToken', result.data.tokens.accessToken);
        localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
        
        return { success: true, user: result.data.user, tokens: result.data.tokens };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      
      if (result.success) {
        if (result.data.requiresVerification) {
          // Show email verification screen
          return { requiresVerification: true, user: result.data.user };
        } else {
          // Store tokens
          localStorage.setItem('accessToken', result.data.tokens.accessToken);
          localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
          
          return { success: true, user: result.data.user, tokens: result.data.tokens };
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }

  async refreshToken() {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      const result = await response.json();
      
      if (result.success) {
        localStorage.setItem('accessToken', result.data.tokens.accessToken);
        localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
        
        this.accessToken = result.data.tokens.accessToken;
        this.refreshToken = result.data.tokens.refreshToken;
        
        return result.data.tokens;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      this.accessToken = null;
      this.refreshToken = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
```

### 2. Wallet Management Service
```javascript
class WalletService {
  constructor(baseUrl, authService) {
    this.baseUrl = baseUrl;
    this.authService = authService;
  }

  async getWallet() {
    try {
      const response = await fetch(`${this.baseUrl}/api/wallet`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authService.accessToken}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }

  async addFunds(amount) {
    try {
      const response = await fetch(`${this.baseUrl}/api/wallet/add-funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authService.accessToken}`
        },
        body: JSON.stringify({ amount })
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }

  async closeWallet() {
    try {
      const response = await fetch(`${this.baseUrl}/api/wallet`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authService.accessToken}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }
}
```

### 3. Market Data Service
```javascript
class MarketService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getCompanies() {
    try {
      const response = await fetch(`${this.baseUrl}/api/market/companies`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }

  async searchCompanies(query) {
    try {
      const response = await fetch(`${this.baseUrl}/api/market/companies/search?q=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }

  async getMarketOverview() {
    try {
      const response = await fetch(`${this.baseUrl}/api/market/overview`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }
}
```

### 4. Portfolio Service
```javascript
class PortfolioService {
  constructor(baseUrl, authService) {
    this.baseUrl = baseUrl;
    this.authService = authService;
  }

  async getPortfolioOverview() {
    try {
      const response = await fetch(`${this.baseUrl}/api/portfolio/overview`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authService.accessToken}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }

  async getHoldings() {
    try {
      const response = await fetch(`${this.baseUrl}/api/portfolio/holdings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authService.accessToken}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }
}
```

### 5. React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useAuth = (authService) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await fetch(`${baseUrl}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await response.json();
          
          if (result.success) {
            setUser(result.data);
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.login(email, password);
      
      if (result.requiresVerification) {
        return { requiresVerification: true, user: result.user };
      } else {
        setUser(result.user);
        return { success: true };
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return { user, loading, error, login, logout };
};
```

---

## 📱 Frontend Integration Checklist

### ✅ Authentication Flow
- [ ] User registration with email verification
- [ ] Login with unverified email handling
- [ ] Token refresh mechanism
- [ ] Logout functionality
- [ ] Persistent authentication state

### ✅ Wallet Management
- [ ] Display wallet balance
- [ ] Add funds functionality
- [ ] Withdraw funds functionality
- [ ] CBDC wallet connection
- [ ] Close wallet functionality (Paytm-like)

### ✅ Market Data
- [ ] Display company listings
- [ ] Search companies
- [ ] Market overview dashboard
- [ ] Real-time price updates

### ✅ Trading Features
- [ ] Buy/sell shares
- [ ] Tokenize shares
- [ ] Buy/sell tokens
- [ ] Convert tokens to shares

### ✅ Portfolio Management
- [ ] Portfolio overview
- [ ] Holdings breakdown
- [ ] Performance tracking
- [ ] Company-specific portfolio view

### ✅ Transaction History
- [ ] Transaction listing
- [ ] Filter by type/status
- [ ] Search transactions
- [ ] Transaction statistics

### ✅ Error Handling
- [ ] Network error handling
- [ ] Authentication error handling
- [ ] Validation error display
- [ ] User-friendly error messages

---

## 🚀 Quick Start Guide

1. **Set up your frontend project**
2. **Configure the base URL**
3. **Implement authentication service**
4. **Add token management**
5. **Create API service classes**
6. **Implement error handling**
7. **Add loading states**
8. **Test all endpoints**

This documentation provides everything needed to integrate with the SEBI POC Backend API. The frontend team can use these examples and patterns to build a complete trading platform interface. 
# API Integration Guide

This document explains how the frontend has been updated to work with the real API endpoints.

## Environment Configuration

Create a `.env` file in the `client` directory with:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Replace `http://localhost:3000` with your actual API base URL.

## Updated API Endpoints

### Authentication

- **Signup**: `POST /api/auth/signup`
- **Login**: `POST /api/auth/login`
- **Send OTP**: `POST /api/auth/send-verification-otp`
- **Verify Email**: `POST /api/auth/verify-email`
- **Logout**: `POST /api/auth/logout`

### Market Data

- **Get Companies**: `GET /api/market/companies`
- **Market Overview**: `GET /api/market/overview`

### Portfolio

- **Portfolio Overview**: `GET /api/portfolio/overview`
- **Holdings**: `GET /api/portfolio/holdings`

### Token Trading

- **Available Tokens**: `GET /api/tokens/available`
- **Buy Tokens**: `POST /api/tokens/buy`
- **Sell Tokens**: `POST /api/tokens/sell`
- **Trading Orders**: `GET /api/tokens/orders`

### Share Tokenization

- **Available for Tokenization**: `GET /api/shares/available-for-tokenization`
- **Tokenize Shares**: `POST /api/shares/tokenize`

### Convert Tokens

- **Available for Conversion**: `GET /api/tokens/available-for-conversion`
- **Convert to Shares**: `POST /api/tokens/convert-to-shares`

### Wallet

- **Get Wallet**: `GET /api/wallet`
- **Add Funds**: `POST /api/wallet/add-funds`
- **Withdraw Funds**: `POST /api/wallet/withdraw-funds`
- **Connect CBDC**: `POST /api/wallet/connect-cbdc`

### Transactions

- **All Transactions**: `GET /api/transactions`

## Key Changes Made

1. **Query Client**: Updated to make real API calls instead of using mock data
2. **Authentication**: Integrated with real auth endpoints using OTP verification
3. **Error Handling**: Added proper error handling for API failures
4. **Token Management**: Automatic token refresh and authorization headers
5. **Base URL Configuration**: Uses environment variable for API base URL

## Testing

1. Set up your backend server
2. Configure the `VITE_API_BASE_URL` environment variable
3. Start the frontend: `npm run dev`
4. Test the authentication flow
5. Verify all API endpoints are working correctly

## Notes

- The frontend now expects the API to return data in the format specified in the Postman collection
- Authentication tokens are stored in cookies and automatically included in API requests
- Error handling has been improved to show meaningful messages to users
- All API calls include proper authorization headers when the user is authenticated

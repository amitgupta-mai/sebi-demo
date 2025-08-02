# 🚀 Frontend Integration Quick Reference

## 📋 Key Changes Summary

### ✅ Wallet Address Moved to User Table

- **Before**: Wallet address stored in `wallets` table
- **After**: Wallet address stored in `users` table as `wallet_address`
- **Impact**: User profile now includes wallet address

### ✅ Close Wallet Functionality Added

- **New Endpoint**: `DELETE /api/wallet`
- **Features**: Paytm-like wallet closure with refund processing
- **Response**: Includes refund amount if balance exists

## 🔧 Essential Integration Steps

### 1. Update User Profile Display

```javascript
// User profile now includes wallet address
const userProfile = {
  id: 'user-id',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  isEmailVerified: true,
  walletAddress: '0x1234567890abcdef...', // ✅ New field
  createdAt: '2025-07-31T06:46:52.588Z',
  updatedAt: '2025-07-31T06:46:52.588Z',
};
```

### 2. Update Wallet Display

```javascript
// Wallet response no longer includes address
const wallet = {
  id: 'wallet-id',
  userId: 'user-id',
  balance: 10000.0,
  totalAdded: 15000.0,
  totalWithdrawn: 5000.0,

  totalBalance: 10000.0,
  // ✅ Address removed from wallet object
};
```

### 3. Implement Close Wallet Feature

```javascript
// Close wallet with refund
const closeWallet = async () => {
  try {
    const response = await fetch(`${baseUrl}/api/wallet`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      if (result.data.refundAmount) {
        // Show refund message
        showMessage(
          `Wallet closed. Refund of ₹${result.data.refundAmount} will be processed within 3-5 business days.`
        );
      } else {
        // Show simple closure message
        showMessage('Wallet closed successfully');
      }
    }
  } catch (error) {
    showError('Failed to close wallet');
  }
};
```

## 📱 UI Components to Update

### 1. User Profile Component

```jsx
const UserProfile = ({ user }) => (
  <div>
    <h2>
      {user.firstName} {user.lastName}
    </h2>
    <p>Email: {user.email}</p>
    <p>Wallet Address: {user.walletAddress || 'Not set'}</p>
    <p>Email Verified: {user.isEmailVerified ? 'Yes' : 'No'}</p>
  </div>
);
```

### 2. Wallet Component

```jsx
const WalletComponent = ({ wallet, user }) => (
  <div>
    <h3>Wallet Balance</h3>
    <p>Total Balance: ₹{wallet.totalBalance}</p>
    <p>Regular Balance: ₹{wallet.balance}</p>

    {/* Show wallet address from user profile */}
    <p>Wallet Address: {user.walletAddress}</p>

    <button onClick={closeWallet}>Close Wallet</button>
  </div>
);
```

### 3. Close Wallet Modal

```jsx
const CloseWalletModal = ({ isOpen, onClose, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <h3>Close Wallet</h3>
    <p>Are you sure you want to close your wallet?</p>
    <p>
      Any remaining balance will be refunded to your registered bank account.
    </p>

    <div>
      <button onClick={onClose}>Cancel</button>
      <button onClick={onConfirm} className='danger'>
        Close Wallet
      </button>
    </div>
  </Modal>
);
```

## 🔄 Migration Notes

### Database Changes

- **Migration**: `1700000000002-MoveWalletAddressToUsers.ts`
- **Action**: Moves address from wallets to users table
- **Backward Compatibility**: Existing addresses are preserved

### API Changes

- **User endpoints**: Now include `walletAddress` field
- **Wallet endpoints**: No longer include `address` field
- **New endpoint**: `DELETE /api/wallet` for closing wallet

## 🧪 Testing Checklist

### ✅ Authentication

- [ ] User registration
- [ ] Email verification
- [ ] Login with unverified email
- [ ] Token refresh
- [ ] Logout

### ✅ Wallet Management

- [ ] Display wallet balance
- [ ] Add funds
- [ ] Withdraw funds
- [ ] Close wallet with balance
- [ ] Close wallet without balance

### ✅ User Profile

- [ ] Display wallet address in profile
- [ ] Update user information
- [ ] Show email verification status

### ✅ Error Handling

- [ ] Network errors
- [ ] Authentication errors
- [ ] Validation errors
- [ ] Business logic errors

## 🚀 Quick Implementation

### 1. Update API Service

```javascript
// Update user service to include wallet address
class UserService {
  async getCurrentUser() {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const result = await response.json();
    return result.data; // Now includes walletAddress
  }
}
```

### 2. Update Wallet Service

```javascript
// Add close wallet method
class WalletService {
  async closeWallet() {
    const response = await fetch(`${baseUrl}/api/wallet`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
  }
}
```

### 3. Update UI Components

```javascript
// Update user profile to show wallet address
const UserProfile = ({ user }) => (
  <div>
    <h2>
      {user.firstName} {user.lastName}
    </h2>
    <p>Wallet: {user.walletAddress || 'Not available'}</p>
  </div>
);
```

## 📞 Support

For any integration issues:

1. Check the full API documentation
2. Verify authentication tokens
3. Test with Postman collection
4. Review error responses
5. Contact backend team

---

**Happy Integration! 🎉**

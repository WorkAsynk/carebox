# API Configuration

This document explains how to configure the API base URL for the Carebox application.

## Current Configuration

The application has been updated to use a centralized API configuration system. The base URL is now set to:

```
https://carebox-backend.onrender.com
```

## Files Updated

The following files have been updated to use the new API configuration:

1. **`src/config/api.js`** - New centralized API configuration file
2. **`src/setupProxy.js`** - Development proxy configuration
3. **`src/component/Create Order/OrderForm.js`** - Order creation API calls
4. **`src/redux/actions/authActions.js`** - Authentication API calls
5. **`src/component/Create Address/AddressForm.js`** - Address creation API calls
6. **`src/pages/AddressList.js`** - Address listing API calls
7. **`src/pages/Users.js`** - User listing API calls

## How to Change the Base URL

### Option 1: Environment Variable (Recommended)

Create a `.env.local` file in the root directory:

```bash
REACT_APP_API_URL=https://your-new-backend-url.com
```

### Option 2: Direct Configuration

Edit `src/config/api.js` and change the `API_BASE_URL` constant:

```javascript
export const API_BASE_URL = 'https://your-new-backend-url.com';
```

### Option 3: Development Proxy

For development, you can also update `src/setupProxy.js`:

```javascript
target: "https://your-new-backend-url.com",
```

## API Endpoints

The following API endpoints are now centrally configured:

- **Authentication**: `/api/auth/login`, `/api/admin/registerNewUser`
- **Users**: `/api/admin/fetchAllUsers`
- **Addresses**: `/api/admin/createAddress`, `/api/admin/fetchAllAddresses`
- **Orders**: `/api/order/createOrder`, `/api/order/addressAutofill`, `/api/order/fetchAllOrders`

## Benefits of the New System

1. **Centralized Configuration**: All API URLs are defined in one place
2. **Easy Maintenance**: Change the base URL once to update all API calls
3. **Environment Support**: Different URLs for development, staging, and production
4. **Type Safety**: Consistent endpoint naming and structure
5. **Error Prevention**: Reduced risk of typos in API URLs

## Usage Example

```javascript
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

// Instead of hardcoded URLs:
// axios.get('https://backend.com/api/users')

// Use the configuration:
const response = await axios.get(buildApiUrl(API_ENDPOINTS.FETCH_ALL_USERS));
```

## Restart Required

After changing the configuration, restart your development server for the changes to take effect.

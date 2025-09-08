// API Configuration
export const API_BASE_URL = 'https://carebox-backend.onrender.com';

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login',
  REGISTER: '/api/admin/registerNewUser',
  
  // User endpoints
  FETCH_ALL_USERS: '/api/admin/fetchAllUsers',
  DELETE_USER: '/api/admin/deleteUser',
  GET_USER: '/api/admin/getUserData',
  EDIT_USER: '/api/admin/editUser',
  // Address endpoints
  CREATE_ADDRESS: '/api/admin/createAddress',
  FETCH_ALL_ADDRESSES: '/api/admin/fetchAllAddresses',
  
  // Order endpoints
  CREATE_ORDER: '/api/order/createOrder',
  ADDRESS_AUTOFILL: '/api/order/addressAutofill',
  FETCH_ALL_ORDERS: '/api/order/fetchAllOrders',
  FETCH_ORDER_DETAIL: '/api/order/fetchOrderDetail',
  EDIT_ORDER: '/api/order/editOrder',
};

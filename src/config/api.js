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
  UPDATE_PASSWORD: '/api/auth/updatePassword',
  
  // User endpoints
  FETCH_ALL_USERS: '/api/admin/fetchAllUsers',
  DELETE_USER: '/api/admin/deleteUser',
  GET_USER: '/api/admin/getUserData',
  EDIT_USER: '/api/admin/editUser',
  AGENT_LIST: '/api/delivery/agentList',
  // Address endpoints
  CREATE_ADDRESS: '/api/admin/createAddress',
  FETCH_ALL_ADDRESSES: '/api/admin/fetchAllAddresses',
  DELETE_ADDRESS: '/api/admin/deleteAddress',
  EDIT_ADDRESS: '/api/admin/editAddress',
  
  // Order endpoints
  CREATE_ORDER: '/api/order/createOrder',
  ADDRESS_AUTOFILL: '/api/order/addressAutofill',
  FETCH_ALL_ORDERS: '/api/order/fetchAllOrders',
  FETCH_ORDER_DETAIL: '/api/order/fetchOrderDetail',
  EDIT_ORDER: '/api/order/editOrder',
  FETCH_ORDERS_BY_DATERANGE: '/api/order/fetchOrdersByDateRange',
  FETCH_ORDER_STATUS_BY_AWB: '/api/order/fetchOrderStatusByAWB',
  
  // Bag endpoints
  CREATE_BAG: '/api/bags/createBag',
  FETCH_ALL_BAGS: '/api/bags/bagList',
  DELETE_BAG: '/api/bags/deleteBag',
  EDIT_BAG: '/api/bags/editBag',
  BAG_DETAIL: '/api/bags/bagDetail',
  
  // Truck endpoints
  CREATE_TRUCK: '/api/trucks/create',
  TRUCK_LIST: '/api/trucks/list',
  TRUCK_DELETE: '/api/trucks/delete',
  TRUCK_EDIT: '/api/trucks/edit',
  TRUCK_DETAIL: '/api/trucks/detail',

  // Delivery endpoints
  CREATE_DELIVERY: '/api/delivery/create',
  DELIVERY_LIST: '/api/delivery/list',
  CREATE_DELIVERY_ORDER: '/api/delivery/createOrder',
};

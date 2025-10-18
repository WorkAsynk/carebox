import { Route, Routes } from 'react-router-dom';
import './App.css';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Login from './pages/Login';
import { useSelector } from 'react-redux';
import CreatUser from './pages/CreatUser';
import CreateOrder from './pages/CreateOrder';
import Users from './pages/Users';
import CreateAddress from './pages/CreateAddress';
import AddressList from './pages/AddressList';
import Orderlist from './pages/Orderlist';
import EditOrder from './pages/EditOrder';
import OrderDetails from './pages/OrderDetails';
import AccountDetails from './pages/AccountDetails';
import InternationalCalculator from './pages/InternationalCalculator';
import DomesticCalculator from './pages/DomesticCalculator';
import CreateInvoice from './pages/CreateInvoice';
import InvoiceDownload from './pages/InvoiceDownload';
import BillingInfo from './pages/BillingInfo';
import FranchiseBillingInfo from './pages/FranchiseBillingInfo';
import ShippingLabel from './pages/ShippingLabel';
import Waybill from './pages/Waybill';
import EditUser from './pages/EditUser';
import EditAddress from './pages/EditAddress';
import Settings from './pages/Settings';
import Tracker from './pages/Tracker';
import CreateBag from './pages/CreateBag';
import BagList from './pages/BagList';
import AssignDeliveryBoy from './pages/AssignDeliveryBoy';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const user = useSelector((state) => state.auth?.user);

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Home - accessible to all authenticated users */}
        <Route path="/" element={isAuthenticated ? <Home /> : <Login />} />
        
        {/* Tracker - accessible to all authenticated users */}
        <Route path="/tracker" element={
          <ProtectedRoute allowedRoles={[]}>
            <Tracker />
          </ProtectedRoute>
        } />
        
        {/* User Management - Admin only */}
        <Route path="/create-user" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <CreatUser />
          </ProtectedRoute>
        } />
        <Route path="/edit-user/:id" element={
          <ProtectedRoute allowedRoles={['Admin', 'Operational Manager']}>
            <EditUser />
          </ProtectedRoute>
        } />
        <Route path="/userlist" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Users />
          </ProtectedRoute>
        } />
        
        {/* Address Management - Admin, Franchise, Operational Manager */}
        <Route path="/create-address" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager']}>
            <CreateAddress />
          </ProtectedRoute>
        } />
        <Route path="/addresslist" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager']}>
            <AddressList />
          </ProtectedRoute>
        } />
        <Route path="/edit-address/:id" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager']}>
            <EditAddress />
          </ProtectedRoute>
        } />
        
        {/* Order Management - Admin, Franchise, Operational Manager, Developer */}
        <Route path="/create-order" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Developer']}>
            <CreateOrder />
          </ProtectedRoute>
        } />
        <Route path="/orderlist" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager', 'Developer']}>
            <Orderlist />
          </ProtectedRoute>
        } />
        <Route path="/edit-order/:id" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager']}>
            <EditOrder />
          </ProtectedRoute>
        } />
        <Route path="/order-details/:id" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager', 'Developer', 'Client']}>
            <OrderDetails />
          </ProtectedRoute>
        } />
        <Route path="/shipping-label/:id" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager', 'Developer', 'Client']}>
            <ShippingLabel />
          </ProtectedRoute>
        } />
        <Route path="/waybill/:id" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager', 'Developer', 'Client']}>
            <Waybill />
          </ProtectedRoute>
        } />
        
        {/* Rate Calculator - Admin, Franchise, Operational Manager, Developer (All except Client) */}
        <Route path="/international-calculator" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager', 'Developer']}>
            <InternationalCalculator />
          </ProtectedRoute>
        } />
        <Route path="/domestic-calculator" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager', 'Developer']}>
            <DomesticCalculator />
          </ProtectedRoute>
        } />

        {/* Invoices - Create Invoice for Admin, Franchise, Operational Manager */}
        <Route path="/create-invoice" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager']}>
            <CreateInvoice />
          </ProtectedRoute>
        } />
        <Route path="/invoice-download" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager', 'Developer', 'Client']}>
            <InvoiceDownload />
          </ProtectedRoute>
        } />

        {/* Finance - Billing Info for Admin and Operational Manager only */}
        <Route path="/billing-info" element={
          <ProtectedRoute allowedRoles={['Admin', 'Operational Manager']}>
            <BillingInfo />
          </ProtectedRoute>
        } />
        <Route path="/franchise-billing-info" element={
          <ProtectedRoute allowedRoles={['Franchise']}>
            <FranchiseBillingInfo />
          </ProtectedRoute>
        } />

        {/* Bags - Admin, Franchise, Operational Manager */}
        <Route path="/create-bag" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager']}>
            <CreateBag />
          </ProtectedRoute>
        } />
        <Route path="/bag-list" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager']}>
            <BagList />
          </ProtectedRoute>
        } />
        <Route path="/assign-delivery-boy" element={
          <ProtectedRoute allowedRoles={['Admin', 'Franchise', 'Operational Manager']}>
            <AssignDeliveryBoy />
          </ProtectedRoute>
        } />
        
        {/* Account Details - accessible to all authenticated users */}
        <Route path="/account-details" element={
          <ProtectedRoute allowedRoles={[]}>
            <AccountDetails />
          </ProtectedRoute>
        } />

        {/* Settings - accessible to all authenticated users */}
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={[]}>
            <Settings />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;

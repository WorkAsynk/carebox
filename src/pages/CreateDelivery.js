import { Input } from '@material-tailwind/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { Autocomplete, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import { API_ENDPOINTS, buildApiUrl } from '../config/api';
import { useSelector } from 'react-redux';
import { ROLES } from '../config/rolePermissions';

const CreateDelivery = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isFranchise = user?.role === ROLES.FRANCHISE;

  // Delivery Boy (Agent) Autocomplete
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentInput, setAgentInput] = useState('');

  // Vehicle
  const [vehicleNumber, setVehicleNumber] = useState('');

  // AWB Numbers
  const [awbInput, setAwbInput] = useState('');
  const [addedAwbList, setAddedAwbList] = useState([]);
  const [awbOptions, setAwbOptions] = useState([]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdDeliveryId, setCreatedDeliveryId] = useState(null);

  // Fetch delivery boys (agents)
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(buildApiUrl(API_ENDPOINTS.AGENT_LIST), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (data?.success && Array.isArray(data?.agents)) {
          const options = data.agents.map(a => ({ id: a.id, name: a.name || a.username || a.full_name || 'Unnamed' }));
          setAgents(options);
        } else {
          setAgents([]);
        }
      } catch (err) {
        // Do not block UI if API fails; keep empty list
        setAgents([]);
      }
    };
    fetchAgents();
  }, []);

  // Fetch AWBs similar to CreateBag: send { type, mf_no? } and filter by shipped
  useEffect(() => {
    const extractMfInteger = (mf) => {
      const digits = String(mf || '').replace(/\D/g, '');
      return digits ? parseInt(digits, 10) : undefined;
    };

    const fetchAwbNumbers = async () => {
      try {
        const payload = {
          type: isFranchise ? 'franchise' : 'admin',
          ...(isFranchise ? { mf_no: extractMfInteger(user?.mf_no) } : {})
        };

        const { data } = await axios.post(
          buildApiUrl(API_ENDPOINTS.FETCH_ALL_ORDERS),
          payload
        );

        const orders = Array.isArray(data) ? data : [];

        console.log(orders);

        const awbs = orders
          .filter(order => {
            console.log(order?.status);
            const s = String(order?.status || order?.status_text || order?.current_status || order?.staff_comment || '').toLowerCase();
            return s === 'order shipped!' || s === 'package shipped' || s.includes('package shipped');
          })
          .map(order => String(order?.awb_no || order?.awb_number || order?.order_no || '').trim())
          .filter(Boolean);

        console.log(awbs);

        setAwbOptions(Array.from(new Set(awbs)));
      } catch (error) {
        setAwbOptions([]);
      }
    };
    if (user) {
      fetchAwbNumbers();
    }
  }, [user, isFranchise]);


  


  const handleAddAwb = () => {
    const val = (awbInput || '').trim();
    if (!val) {
      toast.error('Enter an AWB number');
      return;
    }
    if (addedAwbList.includes(val)) {
      toast.warning('This AWB number is already added');
      return;
    }
    setAddedAwbList(prev => [...prev, val]);
    setAwbInput('');
    toast.success('AWB number added');
  };

  const handleRemoveAwb = (awb) => {
    setAddedAwbList(prev => prev.filter(x => x !== awb));
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setIsSubmitting(true);

    const missing = [];
    if (!selectedAgent?.id) missing.push('Delivery Boy');
    if (!vehicleNumber) missing.push('Vehicle Number');
    if (addedAwbList.length === 0) missing.push('At least one AWB Number');
    if (missing.length) {
      toast.error(`Missing: ${missing.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        delivery_boy_id: selectedAgent.id,
        package_awb_numbers: addedAwbList,
        vehicle_number: vehicleNumber,
      };
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        buildApiUrl(API_ENDPOINTS.CREATE_DELIVERY),
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (data?.success) {
        setCreatedDeliveryId(data.delivery_id);
        setShowSuccess(true);
        toast.success(data.message || 'Delivery created successfully');
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/delivery-list');
        }, 1200);
      } else {
        toast.error(data?.message || 'Failed to create delivery');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1'>
        <Topbar />
        <div className='min-h-screen bg-[#F9FAFB] p-6'>
          <div className='max-w-6xl mx-auto'>
            {/* Header */}
            <div className='flex items-center justify-between mb-6'>
              <div className='flex justify-start items-center gap-5'>
                <Link to={'/'}>
                  <button className='border-[1px] border-[#cecece] px-2 py-2 hover:shadow-blue-gray-200 shadow-sm'>
                    <FaArrowLeft />
                  </button>
                </Link>
                <h2 className='font-semibold text-xl'>Create Delivery</h2>
              </div>
            </div>

            {/* Grid */}
            <div className='min-h-screen bg-gray-50 lg:p-6'>
              <div className='max-w-5xl mx-auto space-y-6'>
                {/* Delivery Details */}
                <div className='bg-white p-4 rounded-md shadow-sm'>
                  <h2 className='font-semibold text-gray-700 mb-2'>Delivery Details</h2>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <div className='col-span-1'>
                      <Autocomplete
                        options={agents}
                        getOptionLabel={(option) => option?.name || ''}
                        value={selectedAgent}
                        onChange={(_, val) => setSelectedAgent(val)}
                        inputValue={agentInput}
                        onInputChange={(_, val) => setAgentInput(val)}
                        renderInput={(params) => (
                          <TextField {...params} label='Delivery Boy' size='small' placeholder='Search Delivery Boy...' />
                        )}
                        fullWidth
                      />
                    </div>
                    <Input
                      label='Vehicle Number'
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder='Enter Vehicle Number'
                    />
                  </div>
                </div>

                {/* AWB Numbers */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                  <div className='bg-white p-4 rounded-md shadow-sm lg:col-span-3'>
                    <h2 className='font-semibold text-gray-700 mb-4'>AWB Numbers</h2>
                    <div className='flex flex-col sm:flex-row gap-3 mb-4'>
                      <div className='flex-1'>
                        <Autocomplete
                          options={awbOptions}
                          freeSolo
                          value={awbInput}
                          onChange={(_, val) => setAwbInput(val || '')}
                          inputValue={awbInput}
                          onInputChange={(_, val) => setAwbInput(val || '')}
                          renderInput={(params) => (
                            <TextField {...params} label='Enter or select AWB Number' size='small' placeholder='Type or choose AWB then click Add' />
                          )}
                          fullWidth
                        />
                      </div>
                      <button
                        type='button'
                        onClick={handleAddAwb}
                        className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center gap-2 whitespace-nowrap'
                      >
                        <FaPlus /> Add
                      </button>
                    </div>

                    {addedAwbList.length > 0 ? (
                      <div className='h-[400px] overflow-y-auto scrollbar-hide'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4'>
                          {addedAwbList.map((awb, index) => (
                            <div key={awb} className='bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow relative'>
                              <div className='absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold'>
                                {index + 1}
                              </div>
                              <div className='mb-3 pr-8'>
                                <p className='text-xs text-gray-500 mb-1'>AWB Number</p>
                                <p className='text-sm font-bold text-gray-900 break-all'>{awb}</p>
                              </div>
                              <button
                                type='button'
                                onClick={() => handleRemoveAwb(awb)}
                                className='w-full mt-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded flex items-center justify-center gap-2 text-sm font-medium transition-colors'
                              >
                                <FaTrash /> Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className='mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200'>
                          <p className='text-sm text-gray-700 text-center'>
                            Total AWB Numbers: <span className='font-bold text-red-600'>{addedAwbList.length}</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className='text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
                        <FaPlus className='mx-auto text-4xl mb-3 text-gray-400' />
                        <p className='text-sm font-medium'>No AWB numbers added yet</p>
                        <p className='text-xs mt-1'>Please add AWB numbers to create the delivery</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className='flex justify-between items-center mt-10'>
              <Link to='/delivery-list'>
                <button className='px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100'>
                  Cancel
                </button>
              </Link>
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={handleSubmit}
                  className={`px-5 py-2 rounded-md text-white ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-black hover:bg-gray-900'}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Create Delivery'}
                </button>
              </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
              <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
                <div className='bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center'>
                  <div className='flex items-center justify-center mb-4'>
                    <CheckCircleIcon className='w-16 h-16 text-green-500 animate-bounce' />
                  </div>
                  <h3 className='text-xl font-semibold mb-1'>Delivery Created</h3>
                  {createdDeliveryId && (
                    <p className='text-gray-600 text-sm mb-2'>Delivery ID: {createdDeliveryId}</p>
                  )}
                  <p className='text-gray-500 text-xs'>Redirecting...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDelivery;



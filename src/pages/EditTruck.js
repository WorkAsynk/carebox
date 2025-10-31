import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@material-tailwind/react';
import { Autocomplete, TextField } from '@mui/material';
import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { ROLES } from '../config/rolePermissions';

const EditTruck = () => {
  const navigate = useNavigate();
  const { awbNo } = useParams();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === ROLES.ADMIN;

  // Truck detail
  const [oldAwbNo, setOldAwbNo] = useState('');
  const [newAwbNo, setNewAwbNo] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverContact, setDriverContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sender (source) / Destination
  const [sender, setSender] = useState({
    id: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [destination, setDestination] = useState({
    id: '',
    consignee_name: '',
    phone: '',
    email: '',
    co_name: '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  // Bag AWBs
  const [availableBagAwbs, setAvailableBagAwbs] = useState([]);
  const [selectedBagAwb, setSelectedBagAwb] = useState(null);
  const [bagAwbInput, setBagAwbInput] = useState('');
  const [addedBagAwbList, setAddedBagAwbList] = useState([]);
  const [loadingBags, setLoadingBags] = useState(false);

  // Load initial: sender from user, available bags, and truck details
  useEffect(() => {
    if (user) {
      setSender({
        id: user.id || '',
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address?.addressLine1 || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || '',
        country: user.address?.country || 'India',
      });
    }
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoadingBags(true);
      try {
        // fetch truck detail by awb_no
        const detailRes = await axios.get(buildApiUrl(API_ENDPOINTS.TRUCK_DETAIL), { params: { awb_no: awbNo } });
        const payload = detailRes?.data || {};
        const truck = payload.truck || payload.truckDetails || payload || null;
        if (truck && (truck.awb_no || truck.id)) {
          setOldAwbNo(truck.awb_no || awbNo || '');
          setVehicleNumber(truck.vehicle_number || '');
          setDriverName(truck.driver_name || '');
          setDriverContact(truck.driver_contact || '');

          // Map sender from source_address when available
          if (truck.source_address) {
            if (typeof truck.source_address === 'object') {
              const addressParts = [
                truck.source_address.address_line,
                truck.source_address.addressLine1,
                truck.source_address.addressLine2,
                truck.source_address.landmark,
              ].filter(Boolean);
              const composedAddress = addressParts.join(', ');
              setSender((prev) => ({
                ...prev,
                // keep name/phone/email from logged-in user if not provided by API
                name: truck.source_address.name || prev.name,
                phone: truck.source_address.phone || prev.phone,
                email: truck.source_address.email || prev.email,
                address: composedAddress || prev.address,
                city: truck.source_address.city || prev.city,
                state: truck.source_address.state || prev.state,
                pincode: truck.source_address.pincode || prev.pincode,
                country: truck.source_address.country || prev.country,
              }));
            } else if (typeof truck.source_address === 'string') {
              setSender((prev) => ({ ...prev, name: truck.source_address || prev.name }));
            }
          }

          // Map destination fields from API response naming
          setDestination((prev) => ({
            ...prev,
            consignee_name: truck.destination_name || prev.consignee_name || '',
            address_line: truck.destination_address_line || prev.address_line || '',
            city: truck.destination_city || prev.city || '',
            state: truck.destination_state || prev.state || '',
            // include pincode if API provides it in any form
            pincode: truck.destination_pincode || truck.destination_zip || prev.pincode || '',
          }));

          // Prefill bag AWBs
          const bagNos = Array.isArray(payload.bag_awb_numbers)
            ? payload.bag_awb_numbers
            : Array.isArray(truck.bag_awb_numbers)
            ? truck.bag_awb_numbers
            : [];
          setAddedBagAwbList(bagNos.map((n) => ({ awb_number: n })));
        } else {
          toast.error('No truck found for provided AWB');
        }

        // fetch available bags
        const res = await axios.get(buildApiUrl(API_ENDPOINTS.FETCH_ALL_BAGS));
        let bagsData = [];
        if (res.data?.bagList && Array.isArray(res.data.bagList)) bagsData = res.data.bagList;
        else if (res.data?.baglist && Array.isArray(res.data.baglist)) bagsData = res.data.baglist;
        else if (res.data?.bags && Array.isArray(res.data.bags)) bagsData = res.data.bags;
        else if (Array.isArray(res.data)) bagsData = res.data;
        const mapped = (bagsData || []).map((bag) => ({
          awb_number: bag.awb_no || bag.bag_awb_no || bag.bagNumber,
          destination: bag.destination_name || bag.destination_address_li || 'N/A',
          package_count: bag.package_awb_nos?.length || 0,
        })).filter(x => !!x.awb_number);
        setAvailableBagAwbs(mapped);
      } catch (e) {
        console.error(e);
        if (e?.response?.status === 400) {
          toast.error('No truck found for the provided AWB');
        } else if (e?.response?.status === 500) {
          toast.error('Server error while fetching truck details');
        }
      } finally {
        setLoadingBags(false);
      }
    };
    load();
  }, [awbNo]);

  const handleDestinationPincodeChange = async (pincode) => {
    setDestination((prev) => ({ ...prev, pincode }));
    if (pincode && pincode.length === 6) {
      try {
        const { data } = await axios.post(buildApiUrl(API_ENDPOINTS.ADDRESS_AUTOFILL), {
          name: user?.name, co_name: user?.co_name, mf_no: user?.mf_no, pincode
        });
        if (Array.isArray(data?.addresses)) {
          const dest = data.addresses.find((a) => a.pincode === pincode && a.is_sender === false);
          if (dest) {
            setDestination({
              id: dest.id,
              consignee_name: dest.consignee_name || '',
              phone: dest.phone || '',
              email: dest.email || '',
              co_name: dest.co_name || '',
              address_line: dest.address_line || '',
              city: dest.city || '',
              state: dest.state || '',
              pincode: dest.pincode || '',
              country: dest.country || 'India',
            });
            toast.success('Address autofilled');
          }
        }
      } catch (e) { console.error(e); }
    }
  };

  const handleAddBagAwb = () => {
    if (!selectedBagAwb) return toast.error('Please select a bag AWB number');
    if (addedBagAwbList.some(x => x.awb_number === selectedBagAwb.awb_number)) return toast.warning('This bag AWB number is already added');
    setAddedBagAwbList(prev => [...prev, selectedBagAwb]);
    setSelectedBagAwb(null);
    setBagAwbInput('');
  };
  const handleRemoveBagAwb = (awbNumber) => setAddedBagAwbList(prev => prev.filter(x => x.awb_number !== awbNumber));

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!oldAwbNo) {
        toast.error('Missing current Truck AWB');
        setIsSubmitting(false);
        return;
      }
      const destinationAddress = destination.id ? destination.id : {
        consignee_name: destination.consignee_name,
        phone: destination.phone,
        email: destination.email,
        address_line: destination.address_line,
        city: destination.city,
        state: destination.state,
        pincode: destination.pincode,
        country: destination.country || 'India',
        is_sender: false,
      };
      const body = {
        old_awb_no: oldAwbNo,
        new_awb_no: newAwbNo || undefined,
        vehicle_number: vehicleNumber || undefined,
        driver_name: driverName || undefined,
        driver_contact: driverContact || undefined,
        source_address_id: user?.id || undefined,
        destination_address_id: destinationAddress || undefined,
        bag_awb_numbers: addedBagAwbList.map(x => x.awb_number),
      };
      const { data } = await axios.put(buildApiUrl(API_ENDPOINTS.TRUCK_EDIT), body);
      if (data?.success) {
        toast.success(data.message || 'Truck updated successfully');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/truck-list');
        }, 1200);
      } else {
        toast.error(data?.message || 'Failed to update truck');
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Failed to update truck');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1'>
        <Topbar />
        <div className="min-h-screen bg-[#F9FAFB] p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex justify-start items-center gap-5">
                <Link to={"/truck-list"}>
                  <button className="border-[1px] border-[#cecece] px-2 py-2 hover:shadow-blue-gray-200 shadow-sm">
                    <FaArrowLeft />
                  </button>
                </Link>
                <h2 className="font-semibold text-xl">Edit Truck: {awbNo}</h2>
              </div>
            </div>

            {/* Form Grid (same layout as AssignTruck) */}
            <div className="min-h-screen bg-gray-50 lg:p-6">
              <div className="max-w-5xl mx-auto space-y-6">
                {/* Truck Detail */}
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h2 className="font-semibold text-gray-700 mb-2">Truck Detail</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Input label="Current Truck AWB (old)" value={oldAwbNo} disabled placeholder="Current Truck AWB" />
                    <Input label="Vehicle Number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())} placeholder="MH01AB1234" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    <Input label="Driver Name" value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Enter Driver Name" />
                    <Input label="Driver Contact" value={driverContact} onChange={(e) => setDriverContact(e.target.value)} placeholder="Enter Driver Contact" />
                  </div>
                </div>

                {/* Sender / Destination & Bag AWB Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Sender + Destination */}
                  <div className="space-y-4 lg:col-span-2 col-span-1">
                    {/* Sender */}
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h2 className="font-semibold text-gray-700 mb-2">Sender Detail</h2>
                      <hr className="mt-2 mb-2" />
                      <div className="grid lg:grid-cols-2 grid-cols-1 gap-2 mb-2">
                        <Input label="Name" value={sender.name} disabled placeholder="Name" />
                        <Input label="Mobile" value={sender.phone} disabled placeholder="Mobile" />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
                        <Input label="Email" value={sender.email} disabled placeholder="Email" />
                        <Input label="Country" value={sender.country} disabled placeholder="Country" />
                      </div>
                      <h2 className="font-semibold text-gray-700 mb-2 mt-2">Address</h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2 mt-4">
                        <Input label="Address" value={sender.address} disabled placeholder="Address" />
                        <Input label="City" value={sender.city} disabled placeholder="City" />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
                        <Input label="State" value={sender.state} disabled placeholder="State" />
                        <Input label="Pincode" value={sender.pincode} disabled placeholder="Pincode" />
                      </div>
                    </div>

                    {/* Destination */}
                    <div className='bg-white p-4 rounded-md shadow-sm '>
                      <h2 className="font-semibold text-gray-700 mb-2">Destination Detail</h2>
                      <hr className="mt-2 mb-2" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
                        <Input label="Name" value={destination.consignee_name} onChange={(e) => setDestination({ ...destination, consignee_name: e.target.value })} placeholder="Enter Name" />
                        <Input label="Mobile" value={destination.phone} onChange={(e) => setDestination({ ...destination, phone: e.target.value })} placeholder="Mobile" />
                        <Input label="Email" value={destination.email} onChange={(e) => setDestination({ ...destination, email: e.target.value })} placeholder="Email" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
                        <Input label="Company Name" value={destination.co_name} onChange={(e) => setDestination({ ...destination, co_name: e.target.value })} placeholder="Company Name" />
                        <Input label="Address" value={destination.address_line} onChange={(e) => setDestination({ ...destination, address_line: e.target.value })} placeholder="Address" />
                        <Input label="City" value={destination.city} onChange={(e) => setDestination({ ...destination, city: e.target.value })} placeholder="City" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
                        <Input label="State" value={destination.state} onChange={(e) => setDestination({ ...destination, state: e.target.value })} placeholder="State" />
                        <Input label="Pincode" value={destination.pincode} onChange={(e) => handleDestinationPincodeChange(e.target.value)} placeholder="Pincode" />
                        <Input label="Country" value={destination.country} onChange={(e) => setDestination({ ...destination, country: e.target.value })} placeholder="Country" />
                      </div>
                    </div>
                  </div>

                  {/* Right: Bag AWB */}
                  <div className="bg-white p-4 rounded-md shadow-sm">
                    <h2 className="font-semibold text-gray-700 mb-2">Bag AWB Numbers</h2>
                    <hr className="mt-2 mb-2" />
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                      <div className="flex-1">
                        <Autocomplete
                          options={availableBagAwbs}
                          getOptionLabel={(option) => option.awb_number || ''}
                          value={selectedBagAwb}
                          onChange={(_, newVal) => setSelectedBagAwb(newVal)}
                          inputValue={bagAwbInput}
                          onInputChange={(_, v) => setBagAwbInput(v)}
                          loading={loadingBags}
                          disabled={loadingBags}
                          renderInput={(params) => (
                            <TextField {...params} label="Select Bag AWB Number" size="small" placeholder={loadingBags ? 'Loading bags...' : 'Search Bag AWB...'} />
                          )}
                        />
                      </div>
                      <button type="button" onClick={handleAddBagAwb} disabled={!selectedBagAwb || loadingBags} className={`px-4 py-2 text-white rounded flex items-center justify-center gap-2 whitespace-nowrap ${!selectedBagAwb || loadingBags ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
                        <FaPlus /> Add
                      </button>
                    </div>

                    {addedBagAwbList.length > 0 ? (
                      <div className='h-[400px] overflow-y-auto scrollbar-hide'>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                          {addedBagAwbList.map((item, index) => (
                            <div key={index} className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow relative">
                              <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">{index + 1}</div>
                              <div className="mb-3 pr-8">
                                <p className="text-xs text-gray-500 mb-1">Bag AWB Number</p>
                                <p className="text-sm font-bold text-gray-900 break-all">{item.awb_number}</p>
                              </div>
                              <button type="button" onClick={() => setAddedBagAwbList(prev => prev.filter(x => x.awb_number !== item.awb_number))} className="w-full mt-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                                <FaTrash /> Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-700 text-center">Total Bag AWB Numbers: <span className="font-bold text-red-600">{addedBagAwbList.length}</span></p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <FaPlus className="mx-auto text-4xl mb-3 text-gray-400" />
                        <p className="text-sm font-medium">No bag AWB numbers added yet</p>
                        <p className="text-xs mt-1">Please add bag AWB numbers to update the truck</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-10">
                  <Link to="/truck-list">
                    <button className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
                  </Link>
                  <div className="flex gap-3">
                    <button type="button" onClick={handleSubmit} className={`px-5 py-2 rounded-md text-white ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-black hover:bg-gray-900'}`} disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Update Truck'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
                  <div className="flex items-center justify-center mb-4">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 animate-bounce" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">Truck Updated</h3>
                  <p className="text-gray-600 text-sm mb-2">AWB: {oldAwbNo}</p>
                  <p className="text-gray-500 text-xs">Redirecting...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTruck;



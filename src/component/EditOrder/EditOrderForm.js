import React, { useEffect, useMemo, useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { Autocomplete, TextField } from '@mui/material'
import { Checkbox, Input, Option, Select } from '@material-tailwind/react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { buildApiUrl, API_ENDPOINTS } from '../../config/api'
import { useSelector } from 'react-redux'

const EditOrderForm = ({ data, loading, error }) => {
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [createdAWB, setCreatedAWB] = useState('');

    // Prefill from data
    const [sender, setSender] = useState({ id: '', name: '', phone: '', email: '', gstNo: '', address: '', co_name: '', pincode: '', city: '', state: '', country: '' });
    const [receiver, setReceiver] = useState({ id: '', name: '', phone: '', email: '', co_name: '', address: '', pincode: '', city: '', state: '', country: '' });
    const [orderId, setOrderID] = useState('');
    const [mfnumber, setmfnumber] = useState(user.mf_no);
    const [mode, setMode] = useState('');
    const [awbNumber, setAwbNumber] = useState('');
    const [awbGenerated, setAwbGenerated] = useState(false);
    const [packageData, setPackageData] = useState({ length: '', width: '', height: '', actual_weight: '', contents_description: '', fragile: false, dangerous: false });
    const [invoiceNo, setInvoiceNo] = useState('');
    const [invoiceValue, setInvoiceValue] = useState('');
    const [ewaybillno, setEwaybillno] = useState('');
    const [ewaybillValue, setewaybillValue] = useState('');

    // Autocomplete + address lists (same behavior as OrderForm)
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [senderPinInput, setSenderPinInput] = useState('');
    const [receiverPinInput, setReceiverPinInput] = useState('');
    const [userInput, setUserInput] = useState('');
    const normalizePin = (pin) => String(pin ?? '').trim();
    const uniquePins = (list = []) => [...new Set(list.map(a => normalizePin(a?.pincode)).filter(Boolean))];
    const senderPins = uniquePins(addresses?.filter(a => a?.is_sender === true));
    const receiverPins = uniquePins(addresses?.filter(a => a?.is_sender === false));
    const [selectedSenderPin, setSelectedSenderPin] = useState('');
    const [selectedReceiverPin, setSelectedReceiverPin] = useState('');

    useEffect(() => {
        if (!data) return;
        setOrderID(data?.order_id || '');
        setAwbNumber(data?.lr_no || data?.order_no || '');
        const incomingMode = (data?.mode || '').toString().toLowerCase();
        setMode(incomingMode === 'air' ? 'Air' : (incomingMode === 'surface' ? 'Surface' : ''));
        setmfnumber(data?.mf_no || data?.mfnumber || '');

        // sender/receiver shape
        const s = data?.sender_address || data?.sender || {};
        const r = data?.receiver_address || data?.receiver || {};
        setSender({
            id: s?.id || '',
            name: s?.consignee_name || s?.name || '',
            phone: s?.phone || '',
            email: s?.email || '',
            gstNo: s?.gst_no || '',
            address: s?.address_line || s?.address || '',
            co_name: s?.co_name || '',
            pincode: s?.pincode || '',
            city: s?.city || '',
            state: s?.state || '',
            country: s?.country || ''
        });
        setReceiver({
            id: r?.id || '',
            name: r?.consignee_name || r?.name || '',
            phone: r?.phone || '',
            email: r?.email || '',
            co_name: r?.co_name || '',
            address: r?.address_line || r?.address || '',
            pincode: r?.pincode || '',
            city: r?.city || '',
            state: r?.state || '',
            country: r?.country || ''
        });

        const pkg = Array.isArray(data?.packages) ? data.packages[0] : {};
        setPackageData({
            length: pkg?.length || '',
            width: pkg?.width || '',
            height: pkg?.height || '',
            actual_weight: pkg?.actual_weight || '',
            contents_description: pkg?.contents_description || '',
            fragile: Boolean(pkg?.fragile),
            dangerous: Boolean(pkg?.dangerous),
        });

        setInvoiceNo(data?.invoice?.inv_no || '');
        setInvoiceValue(data?.invoice?.amount || '');
        setEwaybillno(data?.invoice?.ewaybill || '');
        setewaybillValue(data?.invoice?.ewaybill_value || '');
    }, [data]);

    // Fetch users for autocomplete
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await axios.get(buildApiUrl(API_ENDPOINTS.FETCH_ALL_USERS));
                if (data) setUsers(data.user);
            } catch (e) {
                console.error('Error fetching users:', e);
            }
        };
        fetchUsers();
    }, []);

    const userOptions = users.map((u) => ({ label: `${u.name} - ${u.co_name}`, value: u }));

    const fetchUserData = async (userObj) => {
        if (!userObj) return;
        try {
            const { data } = await axios.post(
                buildApiUrl(API_ENDPOINTS.ADDRESS_AUTOFILL),
                { name: userObj.name, co_name: userObj.co_name }
            );
            if (Array.isArray(data?.addresses)) {
                setAddresses(data.addresses);
            }
        } catch (e) {
            console.error('Error fetching user data:', e);
        }
    };

    const fetchSenderAddress = (pincode) => {
        const targetPin = normalizePin(pincode);
        const senderAddress = addresses?.find(
            (address) => address?.is_sender === true && normalizePin(address?.pincode) === targetPin
        );
        if (senderAddress) {
            setSender(prev => ({
                ...prev,
                id: senderAddress?.id || '',
                address: senderAddress?.address_line || '',
                city: senderAddress?.city || '',
                state: senderAddress?.state || '',
                country: senderAddress?.country || '',
            }));
        }
        return senderAddress || null;
    };

    const fetchReceiverAddress = (pincode) => {
        const targetPin = normalizePin(pincode);
        const receiverAddress = addresses?.find(
            (address) => address?.is_sender === false && normalizePin(address?.pincode) === targetPin
        );
        if (receiverAddress) {
            setReceiver(prev => ({
                ...prev,
                id: receiverAddress?.id,
                name: receiverAddress?.consignee_name,
                phone: receiverAddress?.phone,
                email: receiverAddress?.email,
                pincode: receiverAddress?.pincode,
                address: receiverAddress?.address_line || '',
                city: receiverAddress?.city || '',
                state: receiverAddress?.state || '',
                country: receiverAddress?.country || '',
            }));
        }
        return receiverAddress || null;
    };

    const volumetricWeight = useMemo(() => {
        const l = Number(packageData.length) || 0;
        const w = Number(packageData.width) || 0;
        const h = Number(packageData.height) || 0;
        return (l * w * h) / 5000;
    }, [packageData.length, packageData.width, packageData.height]);

    const chargeableWeight = useMemo(() => {
        const actual = Number(packageData.actual_weight) || 0;
        return Math.max(actual, volumetricWeight);
    }, [packageData.actual_weight, volumetricWeight]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');
        try {
          const payload = {
            order_pk_id: data?.id || data?.order_pk_id || orderId,
            agent_id: user?.id || data?.agent_id || '',
            created_by: user?.id || '',
            // keep the request shape consistent with create
            sender_address_id: sender.id,
            receiver_address_id: receiver.id,
            inv_no: invoiceNo,
            amount: invoiceValue,
            ewaybill: ewaybillno,            // from the correct field
            ewaybill_value: ewaybillValue,   // optional, if your API supports it
            order_id: orderId,
            order_no: awbNumber,
            lr_no: awbNumber,
            mode,                            // add mode
            mf_no: mfnumber,                 // add MF
            package_data: [{
              length: Number(packageData.length),
              width: Number(packageData.width),
              height: Number(packageData.height),
              actual_weight: Number(packageData.actual_weight),
              volumetric_weight: Number(volumetricWeight),
              contents_description: packageData.contents_description,
              fragile: Boolean(packageData.fragile),
              dangerous: Boolean(packageData.dangerous),
            }],
          };
      
          await axios.post(buildApiUrl(API_ENDPOINTS.EDIT_ORDER), payload);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            navigate('/orderlist');
          }, 1200);
        } catch (err) {
          console.error('Failed to update order', err);
          setErrorMessage('Failed to update order');
        } finally {
          setIsSubmitting(false);
        }
      };

    if (loading) return <div className="p-6">Loading...</div>
    if (error) return <div className="p-6 text-red-600">{error}</div>
    if (!data) return <div className="p-6">No order found</div>

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex justify-start items-center gap-5">
						<Link to={"/orderlist"}>
							<button className="border-[1px] border-[#cecece] px-2 py-2 hover:shadow-blue-gray-200 shadow-sm">
								<FaArrowLeft />
							</button>
						</Link>
						<h2 className="font-semibold text-xl">Edit Order</h2>
					</div>
					<button className="text-xs text-blue-500 border border-blue-200 rounded px-2 py-1">Learn More</button>
				</div>

				{/* Form Grid */}
				<div className="min-h-screen bg-gray-50 p-6">
					<div className="max-w-5xl mx-auto space-y-6">
						{/* Order Detail Section */}
						<div className="bg-white p-4 rounded-md shadow-sm">
							<h2 className="font-semibold text-gray-700 mb-2">Order Detail</h2>
							<div className="grid grid-cols-2 gap-4">
								<div className='cols-span-1'>
									<Input label="AWB Number" value={awbNumber} disabled={awbGenerated} onChange={(e) => setAwbNumber(e.target.value)} placeholder="Enter AWB Number" />
									{/* <div className='flex justify-start items-center'>
										<Checkbox
											checked={awbGenerated}
											onChange={(e) => setAwbGenerated(e.target.checked)}
										/>
										<label className="text-sm">Auto-generate AWB Number</label>
									</div> */}

								</div>
								<Input label="MF Number" disabled={true} value={mfnumber} onChange={(e) => setmfnumber(e.target.value)} placeholder="Enter MF Number" />
								<Select
									value={mode}
									onChange={(val) => setMode(val)}
									label="Mode">
									<Option value="Air">Air</Option>
									<Option value="Surface">Surface</Option>
								</Select>
								<Input label='Order ID' value={orderId} onChange={(e) => setOrderID(e.target.value)} placeholder='Enter Order ID' />
							</div>
						</div>

						{/* Sender / Receiver & Product Info Section */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{/* Sender Details */}
							<div className="space-y-4 col-span-2">
								<div className="bg-white p-4 rounded-md shadow-sm">
									<h2 className="font-semibold text-gray-700 mb-2">Sender Detail</h2>

									{/* Select User by Name and Co_name */}
									<div className="grid grid-cols-2 gap-2 mb-2">
										<Autocomplete
											options={userOptions}
											getOptionLabel={(option) => option?.label || ""}
											value={
												selectedUser
													? { label: `${selectedUser.name} - ${selectedUser.co_name}`, value: selectedUser }
													: null
											}
											onChange={(_, newValue) => {
												const userObj = newValue?.value || null;
												setSelectedUser(userObj);
												if (userObj) fetchUserData(userObj);   // <-- call with object
											}}
											inputValue={userInput}
											onInputChange={(_, newInputValue) => setUserInput(newInputValue)}
											renderInput={(params) => <TextField {...params} label="Select User" size="small" />}
											fullWidth
										/>
										<Autocomplete
											options={senderPins}                 // array of strings (e.g., ["400001", "400002", ...])
											value={selectedSenderPin || null}    // controlled value
											onChange={(_, newValue) => {
												const pin = normalizePin(newValue || '');
												setSelectedSenderPin(pin);
												if (pin) fetchSenderAddress(pin);
											}}
											inputValue={senderPinInput}
											onInputChange={(_, newInputValue, reason) => {
												setSenderPinInput(newInputValue);
												// Optional: auto-fetch when user types a full 6-digit pin
												const pin = normalizePin(newInputValue);
												if (reason !== 'reset' && /^\d{6}$/.test(pin)) {
													setSelectedSenderPin(pin);
													fetchSenderAddress(pin);
												}
											}}
											freeSolo
											renderInput={(params) => (
												<TextField {...params} label="Select Sender Pincode" size="small" />
											)}
											fullWidth
										/>

									</div>

									<hr className="mt-2 mb-2" />

									{/* Auto-filled Sender Details */}
									<div className="grid grid-cols-2 gap-2 mb-2">
										<Input
											label="Name"
											placeholder="Enter Name"
											value={sender.name}
											onChange={(e) => setSender({ ...sender, name: e.target.value })}
										/>
										<Input
											label="Mobile"
											placeholder="Enter Your Mobile Number"
											value={sender.phone}
											onChange={(e) => setSender({ ...sender, phone: e.target.value })}
										/>
									</div>

									<div className="grid grid-cols-2 gap-2 mt-2">
										<Input
											label="Email"
											placeholder="Enter Email"
											value={sender.email}
											onChange={(e) => setSender({ ...sender, email: e.target.value })}
										/>
										<Input
											label="GST"
											placeholder="Enter Your GST"
											value={sender.gstNo || ''}
											onChange={(e) => setSender({ ...sender, gstNo: e.target.value })}
										/>
									</div>

									<h2 className="font-semibold text-gray-700 mb-2 mt-2">Address</h2>
									<div className="grid grid-cols-2 gap-2 mb-2 mt-4">
										<Input
											label="Address"
											placeholder="Address"
											value={sender.address}
											onChange={(e) => setSender({ ...sender, address: e.target.value })}
										/>
										<Input
											label="City"
											placeholder="City"
											value={sender.city}
											onChange={(e) => setSender({ ...sender, city: e.target.value })}
										/>
									</div>

									<div className="grid grid-cols-2 gap-2 mb-2">
										<Input
											label="State"
											placeholder="State"
											value={sender.state}
											onChange={(e) => setSender({ ...sender, state: e.target.value })}
										/>
										<Input
											label="Country"
											placeholder="Country"
											value={sender.country}
											onChange={(e) => setSender({ ...sender, country: e.target.value })}
										/>
									</div>
								</div>
								<div className='bg-white p-4 rounded-md shadow-sm '>
									<h2 className="font-semibold text-gray-700 mb-2">Reciver Detail</h2>
									<hr className="mt-2 mb-2" />

									<div className='grid grid-cols-3 gap-2 mb-2 '>
										<Autocomplete
											options={receiverPins} // array of strings (e.g., ["400003", "400004", ...])
											value={selectedReceiverPin || null} // controlled value
											onChange={(_, newValue) => {
												const pin = normalizePin(newValue || '');
												setSelectedReceiverPin(pin);
												if (pin) fetchReceiverAddress(pin);
											}}
											inputValue={receiverPinInput}
											onInputChange={(_, newInputValue, reason) => {
												setReceiverPinInput(newInputValue);
												// Auto-fetch when user types a full 6-digit pin
												const pin = normalizePin(newInputValue);
												if (reason !== 'reset' && /^\d{6}$/.test(pin)) {
													setSelectedReceiverPin(pin);
													fetchReceiverAddress(pin);
												}
											}}
											freeSolo
											renderInput={(params) => (
												<TextField {...params} label="Select Receiver Pincode" size="small" />
											)}
											fullWidth
										/>
									</div>
									{/* Auto-filled Sender Details */}
									<div className="grid grid-cols-3 gap-2 mb-2">

										<Input
											label="Name"
											placeholder="Enter Name"
											value={receiver.name}
											onChange={(e) => setReceiver({ ...receiver, name: e.target.value })}
										/>
										<Input
											label="Mobile"
											placeholder="Enter Your Mobile Number"
											value={receiver.phone}
											onChange={(e) => setReceiver({ ...receiver, phone: e.target.value })}
										/>
										<Input
											label="Email"
											placeholder="Enter Your Email"
											value={receiver.email}
											onChange={(e) => setReceiver({ ...receiver, email: e.target.value })}
										/>
									</div>
									<div className="grid grid-cols-3 gap-2 mb-2">
										<Input
											label="Company Name"
											placeholder="Enter Company Name"
											value={receiver.co_name}
											onChange={(e) => setReceiver({ ...receiver, co_name: e.target.value })}
										/>
										<Input
											label="Address"
											placeholder="Enter Your Address"
											value={receiver.address}
											onChange={(e) => setReceiver({ ...receiver, address: e.target.value })}
										/>
										<Input
											label="City"
											placeholder="Enter Your City"
											value={receiver.city}
											onChange={(e) => setReceiver({ ...receiver, city: e.target.value })}
										/>
									</div>
									<div className="grid grid-cols-3 gap-2 mb-2">
										<Input
											label="State"
											placeholder="Enter State"
											value={receiver.state}
											onChange={(e) => setReceiver({ ...receiver, state: e.target.value })}
										/>
										<Input
											label="Pincode"
											placeholder="Enter Your Pincode"
											value={receiver.pincode}
											onChange={(e) => setReceiver({ ...receiver, pincode: e.target.value })}
										/>
										<Input
											label="Country"
											placeholder="Enter Your Country"
											value={receiver.country}
											onChange={(e) => setReceiver({ ...receiver, country: e.target.value })}
										/>
									</div>
								</div>
							</div>

							{/* Product Info Section */}
							<div className="bg-white p-4 rounded-md shadow-sm space-y-4">
								<h2 className="font-semibold text-gray-700 mb-2">Product Detail</h2>
								<Input value={packageData?.contents_description} onChange={(e) => setPackageData({ ...packageData, contents_description: e.target.value })} label="Reference ID" placeholder="Enter Your Reference ID" />
								<div className="w-full">
									<label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
									<div className="flex items-center gap-3">
										<div className="w-[33%]">
											<Input label="Length" value={packageData?.length} onChange={(e) => setPackageData({ ...packageData, length: e.target.value })} type="number" containerProps={{ className: 'min-w-[66px]' }} />
										</div>
										<Input label="Width" value={packageData?.width} onChange={(e) => setPackageData({ ...packageData, width: e.target.value })} type="number" containerProps={{ className: 'min-w-[66px]' }} />
										<Input label="Height" value={packageData?.height} onChange={(e) => setPackageData({ ...packageData, height: e.target.value })}
											type="number" containerProps={{ className: 'min-w-[66px]' }} />
										<div className="px-4 py-[0.65rem] bg-gray-100 rounded text-sm text-gray-600 font-medium">
											cm
										</div>
									</div>
									<p className="text-xs text-gray-500 mt-2">Length + width + Height should be at least 15 cm</p>
								</div>

								<div className="space-y-4">
									{/* Package Weight Input */}
									<div className="w-full">
										<label className="block text-sm font-medium text-gray-700 mb-1">Package weight</label>
										<div className="flex items-center">
											<Input
												type="number"
												placeholder="Enter package weight"
												className="w-full"
												value={packageData?.actual_weight} onChange={(e) => setPackageData({ ...packageData, actual_weight: e.target.value })}
												containerProps={{ className: 'min-w-0' }}
											/>
											<div className="ml-2 px-4 py-[0.65rem] bg-gray-100 rounded text-sm text-gray-600 font-medium">
												gm
											</div>
										</div>
										<p className="text-xs text-gray-500 mt-1">Packaged weight should be at least 50 grams</p>
									</div>

									{/* Info Box */}
									<div className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-sm p-4 rounded-md flex items-start gap-2">
										<InformationCircleIcon className="w-5 h-5 mt-0.5" />
										<span>
											The estimated cost may vary from the final shipping cost based on the packaged
											dimensions & weight measured before delivery.
										</span>
									</div>

									{/* Total Chargeable Weight */}
									<div className="bg-gray-50 border border-gray-100 rounded-md p-4">
										<div className="flex items-center justify-between">
											<span className="font-medium text-sm text-gray-800">Chargeable Weight </span>
											<InformationCircleIcon className="w-4 h-4 text-gray-400 ml-2" />
										</div>
										<p className="text-gray-500 text-sm mt-1">{chargeableWeight} gm</p>
									</div>
								</div>
							</div>
						</div>

						{/* Bottom Section - Invoice No */}
						<div className="bg-white p-4 rounded-md shadow-sm">
							<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
								<Input label="Invoice No" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
								<Input label="Invoice Value *" value={invoiceValue} onChange={(e) => setInvoiceValue(e.target.value)} />
								{invoiceValue > 35000 && (
									<>
										<Input
											label="Eway Bill No"
											value={ewaybillno}
											onChange={(e) => setEwaybillno(e.target.value)}
										/>
										<Input
											label="Eway Bill Value"
											value={ewaybillValue}
											onChange={(e) => setewaybillValue(e.target.value)}
										/>
									</>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Footer Buttons */}
				<div className="flex justify-between items-center mt-10">
					<button className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
					<div className="flex gap-3">
						{/* <button className="px-5 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">Create Order and Manifest Later</button> */}
						<button type="button" className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
							Save Changes
						</button>
						<button onClick={handleSubmit} className={`px-5 py-2 rounded-md text-white ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-black hover:bg-gray-900'}`} disabled={isSubmitting}>
							{isSubmitting ? 'Editing...' : 'Edit Order'}
						</button>
					</div>
				</div>

				{/* Success Modal */}
				{showSuccess && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
						<div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
							<div className="flex items-center justify-center mb-4">
								<CheckCircleIcon className="w-16 h-16 text-green-500 animate-bounce" />
							</div>
							<h3 className="text-xl font-semibold mb-1">Order Updated</h3>
							<p className="text-gray-600 text-sm mb-2">AWB: {createdAWB || awbNumber}</p>
							<p className="text-gray-500 text-xs">Redirecting to order list...</p>
						</div>
					</div>
				)}

				{/* Error message */}
				{errorMessage && (
					<div className="mt-4 text-red-500 text-sm">
						<p>{errorMessage}</p>
					</div>
				)}
			</div>
		</div>
  )
}

export default EditOrderForm
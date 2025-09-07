import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Input, Select, Option, Checkbox, Button } from '@material-tailwind/react';
import { Autocomplete, TextField } from '@mui/material';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const AddressForm = () => {
	const navigate = useNavigate();
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [showOverlay, setShowOverlay] = useState(false);
	const [overlayStatus, setOverlayStatus] = useState('loading'); // 'loading' | 'success'

	// ✅ Use final field names in state
	const [formData, setFormData] = useState({
		is_sender: false,        // was: label -> now boolean
		consignee_name: '',         // was: user_name / consignee_name
		phone: '',               // was: additional_phone
		email: '',
		address_line: '',
		city: '',
		state: '',
		pincode: '',
		country: '',
		preferred_slot: '',
		user_id: '',             // hidden from UI
	});

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const res = await axios.get(buildApiUrl(API_ENDPOINTS.FETCH_ALL_USERS));
				setUsers(res.data.user || []);
			} catch (err) {
				console.error('Error fetching users', err);
			}
		};
		fetchUsers();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setShowOverlay(true);
		setOverlayStatus('loading');

		if (!selectedUser) {
			toast.error('Please select a consignee from suggestions');
			setLoading(false);
			setShowOverlay(false);
			return;
		}

		// Basic validations
		const required = [
			['address_line', 'Please add Address'],
			['city', 'Please add City'],
			['country', 'Please add Country'],
			['pincode', 'Please add Pincode'],
			['email', 'Please add Email address'],
			['preferred_slot', 'Please select Slot'],
			['consignee_name', 'Please add Contact Person Name'],
		];
		for (const [key, msg] of required) {
			if (!String(formData[key] || '').trim()) {
				toast.error(msg);
				setLoading(false);
				setShowOverlay(false);
				return;
			}
		}

		// ✅ Final payload with remapped keys
		const payload = {
			is_sender: formData.is_sender,
			consignee_name: formData.consignee_name,
			phone: formData.phone,
			email: formData.email,
			address_line: formData.address_line,
			city: formData.city,
			state: formData.state,
			pincode: formData.pincode,
			country: formData.country,
			preferred_slot: formData.preferred_slot,
			user_id: selectedUser.id,
		};

		try {
			const res = await axios.post(buildApiUrl(API_ENDPOINTS.CREATE_ADDRESS), payload);
			if (res.data.success) {
				setOverlayStatus('success');
				toast.success('Address added successfully');
				setTimeout(() => {
					setShowOverlay(false);
					navigate('/');
				}, 800);
			} else {
				toast.error(res.data.message || 'Something went wrong');
				setShowOverlay(false);
			}
		} catch (err) {
			toast.error('This is a database error, please inform authorities');
			console.error(err);
			setShowOverlay(false);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<ToastContainer />
			<div className="min-h-screen bg-[#F9FAFB] p-6">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-4">
							<Link to="/">
								<button className="border border-gray-300 px-3 py-2 rounded hover:bg-gray-100">
									<FaArrowLeft />
								</button>
							</Link>
							<h2 className="text-xl font-semibold">Create Address</h2>
						</div>
					</div>

					{/* User Detail */}
					<div className="space-y-2 bg-white p-6 rounded-md shadow-sm">
						<h2 className="font-semibold text-gray-700">User Detail</h2>
						<div className="grid grid-cols-2 gap-4">
							<Autocomplete
								options={users}
								// Fallbacks so it doesn't crash if name is missing
								getOptionLabel={(option) => option?.name || option?.email || ''}
								onChange={(e, newValue) => setSelectedUser(newValue)}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Consignee Name (Search user)"
										required
										fullWidth
									/>
								)}
							/>

							{/* ✅ Replaced Sender/Receiver select with a boolean checkbox */}
							<div className="flex items-center h-full">
								<div className="flex items-center h-full">
									<Checkbox
										label="Sender"
										checked={formData.is_sender === true}
										onChange={(e) =>
											setFormData(prev => ({ ...prev, is_sender: true }))
										}
									/>
									<Checkbox
										label="Receiver"
										checked={formData.is_sender === false}
										onChange={(e) =>
											setFormData(prev => ({ ...prev, is_sender: false }))
										}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Address Detail */}
					<div className="space-y-2 bg-white p-6 mt-5 rounded-md shadow-sm">
						<h2 className="font-semibold text-gray-700">Address Detail</h2>

						{/* ✅ client_name replaces consignee_name */}
						<Input label="Contact Person Name" name="consignee_name" onChange={handleChange} />

						<div className="grid grid-cols-2 gap-4">
							<Input label="Email" name="email" onChange={handleChange} />
							{/* ✅ phone replaces additional_phone */}
							<Input label="Phone" name="phone" onChange={handleChange} />
							<Input label="Address Line" name="address_line" onChange={handleChange} />
							<Input label="City" name="city" onChange={handleChange} />
							<Input label="State" name="state" onChange={handleChange} />
							<Input label="Pincode" name="pincode" onChange={handleChange} />
							<Input label="Country" name="country" onChange={handleChange} />

							<Select
								label="Select Slot"
								name="preferred_slot"
								value={formData.preferred_slot}
								onChange={(val) => setFormData(prev => ({ ...prev, preferred_slot: val }))}
								required
							>
								<Option value="1">1:00pm - 4:00pm</Option>
								<Option value="2">4:00pm - 7:00pm</Option>
								<Option value="3">7:00pm - 10:00pm</Option>
							</Select>
						</div>
					</div>

					<div className="flex justify-end gap-4 mt-4">
						<Button onClick={handleSubmit} disabled={loading}>
							{loading ? 'Submitting...' : 'Submit'}
						</Button>
					</div>
				</div>
			</div>

			{showOverlay && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
						{overlayStatus === 'loading' && (
							<div className="flex flex-col items-center">
								<div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin mb-3"></div>
								<p className="text-gray-700 text-sm">Submitting address...</p>
							</div>
						)}
						{overlayStatus === 'success' && (
							<div className="flex flex-col items-center">
								<CheckCircleIcon className="w-14 h-14 text-green-500" />
								<p className="text-gray-700 text-sm mt-2">Address added successfully</p>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default AddressForm;

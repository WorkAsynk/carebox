import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Input, Select, Option, Checkbox, Button } from '@material-tailwind/react';
import { Autocomplete, TextField } from '@mui/material';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const AddressForm = () => {
	const navigate = useNavigate()
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [loading, setLoading] = useState(false)
	const [formData, setFormData] = useState({
		label: '',
		address_line: '',
		pincode: '',
		city: '',
		state: '',
		additional_phone: '',
		consignee_name: '',
		email: '',
		country: '',
		preferred_slot: '',
		user_id: '', // hidden from UI
	});

	// Fetch all users on mount
	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/fetchAllUsers`);
				setUsers(res.data.user || []);
			} catch (err) {
				console.error('Error fetching users', err);
			}
		};
		fetchUsers();
	}, []);

	console.log(users)

	// Handle form changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Handle submit
	const handleSubmit = async (e) => {
		setLoading(true); // Set loading to true when the form is submitted
		e.preventDefault();

		if (!selectedUser) {
			toast.error('Please select a consignee from suggestions');
			setLoading(false); // Make sure to stop the loading when validation fails
			return;
		}
		if (!formData?.address_line) {
			toast.error('Please Add Address');
			setLoading(false); // Make sure to stop the loading when validation fails
			return;
		}
		if (!formData?.city) {
			toast.error('Please Add City');
			setLoading(false); // Make sure to stop the loading when validation fails
			return;
		}
		if (!formData?.country) {
			toast.error('Please Add Country');
			setLoading(false); // Make sure to stop the loading when validation fails
			return;
		}
		if (!formData?.pincode) {
			toast.error('Please Add Pincode');
			setLoading(false); // Make sure to stop the loading when validation fails
			return;
		}
		if (!formData?.email) {
			toast.error('Please Add Email address');
			setLoading(false); // Make sure to stop the loading when validation fails
			return;
		}
		if (!formData?.preferred_slot) {
			toast.error('Please Select Slot');
			setLoading(false); // Make sure to stop the loading when validation fails
			return;
		}
		if (!formData?.consignee_name) {
			toast.error('Please Add Contact Person Name');
			setLoading(false); // Make sure to stop the loading when validation fails
			return;
		}


		const payload = { ...formData, user_id: selectedUser.id };

		try {
			const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/createAddress`, payload);
			if (res.data.success) {
				toast.success('Address added successfully');
				navigate('/')
			} else {
				toast.error(res.data.message || 'Something went wrong');
			}
		} catch (err) {
			toast.error('This is a database error, please inform authorities');
			console.error(err);
		} finally {
			setLoading(false); // Ensure this runs after success or failure
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

					<div className="space-y-2 bg-white p-6 rounded-md shadow-sm">
						<h2 className="font-semibold text-gray-700">User Detail
						</h2>
						<div className="grid grid-cols-2 gap-4">

							<Autocomplete
								options={users}
								getOptionLabel={(option) => option.name || ''}
								onChange={(e, newValue) => setSelectedUser(newValue)}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Consignee Name (Search user)"
										required
										sx={{
											width: '100%',  // Ensure it fills available space
											height: '50px', // Adjust the height to match other fields
										}}
									/>
								)}
							/>
							<Select
								label="Select Address Type"
								name="label"
								value={formData.label}
								onChange={(val) => setFormData({ ...formData, label: val })}
								required
							>
								<Option value="Sender">Sender</Option>
								<Option value="Reciver">Reciver</Option>
							</Select>
						</div>
					</div>
					<div className="space-y-2 bg-white p-6 mt-5 rounded-md shadow-sm">
						<h2 className="font-semibold text-gray-700">Address Detail
						</h2>
						<Input label="Contact Person Name" name="consignee_name" onChange={handleChange} />
						<div className="grid grid-cols-2 gap-4">
							<Input label="Email" name="email" onChange={handleChange} />
							<Input label="Additional Phone" name="additional_phone" onChange={handleChange} />
							<Input label="Address Line" name="address_line" onChange={handleChange} />
							<Input label="City" name="city" onChange={handleChange} />
							<Input label="State" name="state" onChange={handleChange} />
							<Input label="Pincode" name="pincode" onChange={handleChange} />
							<Input label="Country" name="country" onChange={handleChange} />
							<Select
								label="Select Slot"
								name="preferred_slot"
								value={formData.preferred_slot}
								onChange={(val) => setFormData({ ...formData, preferred_slot: val })}
								required
							>
								<Option value="1">1:00pm - 4:00pm</Option>
								<Option value="2">4:00pm - 7:00pm</Option>
								<Option value="3">7:00pm - 10:00pm</Option>
							</Select>

						</div>
					</div>
					<div className="flex justify-end gap-4 mt-4">
						<Button
							onClick={handleSubmit}
							disabled={loading}
							className=""
						>
							{loading ? "Submiting..." : "Submit"}
						</Button>
					</div>
				</div>
			</div>
		</>
	);
};

export default AddressForm;

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerAdmin } from '../../redux/actions/authActions';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Input, Option, Select } from '@material-tailwind/react';
import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon, MapPinIcon } from '@heroicons/react/24/solid';

const CreateUserForm = () => {
	const dispatch = useDispatch();
	const { loading, registerSuccess, error } = useSelector((state) => state.auth);
	const [showPassword, setShowPassword] = useState(false);
	const [showOverlay, setShowOverlay] = useState(false);
	const [overlayStatus, setOverlayStatus] = useState('loading'); // 'loading' | 'success'
	const [currentStep, setCurrentStep] = useState(1);
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		gst_no: '',
		co_name: '',
		co_location: '',
		role: '',
		mf_no: '',
		password: '',
	});

	const [addressData, setAddressData] = useState({
		addressLine1: '',
		addressLine2: '',
		landmark: '',
		city: '',
		pincode: '',
	});

	const togglePasswordVisibility = () => setShowPassword(!showPassword);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleAddressChange = (e) => {
		setAddressData({ ...addressData, [e.target.name]: e.target.value });
	};

	const nextStep = () => {
		setCurrentStep(currentStep + 1);
	};

	const prevStep = () => {
		setCurrentStep(currentStep - 1);
	};

	useEffect(() => {
		if (loading) {
			setShowOverlay(true);
			setOverlayStatus('loading');
			return;
		}
		if (!loading && registerSuccess) {
			setOverlayStatus('success');
			setShowOverlay(true);
			const t = setTimeout(() => {
				setShowOverlay(false);
				navigate('/userlist');
			}, 800);
			return () => clearTimeout(t);
		}
		if (!loading && error) {
			setShowOverlay(false);
		}
	}, [loading, registerSuccess, error]);

	const handleSubmit = (e) => {
		e.preventDefault();
		setShowOverlay(true);
		setOverlayStatus('loading');
		
		// Combine user data and address data
		const completeUserData = {
			...formData,
			address: addressData
		};
		
		dispatch(registerAdmin(completeUserData));
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 py-8">
			<div className="w-full max-w-md bg-white p-8 rounded-xl border border-gray-200">
				<h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
					Create New User
				</h2>
				<form onSubmit={handleSubmit} className="space-y-5">
					{[
						{ label: 'Full Name', name: 'name', type: 'text' },
						{ label: 'Email Address', name: 'email', type: 'email' },
						{ label: 'Phone Number', name: 'phone', type: 'text' },
						{ label: 'GST Number', name: 'gst_no', type: 'text' },
						{ label: 'Company Name', name: 'co_name', type: 'text' },
						{ label: 'Company location', name: 'co_location', type: 'text' },
					].map(({ label, name, type }) => (
						<div key={name}>
							<Input
								id={name}
								type={type}
								name={name}
								label={label}
								value={formData[name]}
								onChange={handleChange}
								required
							/>
						</div>
					))}

					<div>
						<Select
							label="Select Role"
							name="role"
							value={formData.role}
							onChange={(val) => setFormData({ ...formData, role: val })}
							required
						>
							<Option value="">Select Role</Option>
							<Option value="Admin">Admin</Option>
							<Option value="Developer">Developer</Option>
							<Option value="Client">Client</Option>
							<Option value="Operation Manager">Operation Manager</Option>
							<Option value="Franchise">Franchise</Option>
							<Option value="Accountant">Accountant</Option>
						</Select>
					</div>

					<div className={`transition-all duration-300 overflow-hidden ${formData.role === 'Franchise' ? 'max-h-28 opacity-100 ' : 'max-h-0 opacity-0'}`}>
						<Input
							id="mf_no"
							type="number"
							name="mf_no"
							label="MF Number"
							value={formData.mf_no}
							onChange={handleChange}
							required={formData.role === 'Franchise'}
						/>
					</div>

					<div>
						<div className="relative">
							<Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								label="Password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								required
							/>
							<span
								onClick={togglePasswordVisibility}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
							>
								{showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
							</span>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className={`w-full py-2 px-4 rounded-md text-white font-semibold transition duration-200 ${loading
							? 'bg-red-300 cursor-not-allowed'
							: 'bg-red-600 hover:bg-red-700'
							}`}
					>
						{loading ? 'Registering...' : 'Register'}
					</button>
				</form>
			</div>

			{showOverlay && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
						{overlayStatus === 'loading' && (
							<div className="flex flex-col items-center">
								<div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin mb-3"></div>
								<p className="text-gray-700 text-sm">Creating user...</p>
							</div>
						)}
						{overlayStatus === 'success' && (
							<div className="flex flex-col items-center">
								<CheckCircleIcon className="w-14 h-14 text-green-500" />
								<p className="text-gray-700 text-sm mt-2">User created successfully</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default CreateUserForm;

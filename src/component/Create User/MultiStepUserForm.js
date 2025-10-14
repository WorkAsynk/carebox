import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerAdmin } from '../../redux/actions/authActions';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Input, Option, Select } from '@material-tailwind/react';
import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon, MapPinIcon, DocumentChartBarIcon, MapIcon, XMarkIcon } from '@heroicons/react/24/solid';
import RateChartManager from '../RateChartManager/RateChartManager';

const MultiStepUserForm = () => {
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

	// MF Number generation logic
	const generateMFNumber = () => {
		// Get current counter from localStorage or start from 0
		let mfCounter = parseInt(localStorage.getItem('mfCounter') || '0');
		
		console.log('=== MF Number Generation ===');
		console.log('Current Counter (before increment):', mfCounter);
		
		// Increment counter
		mfCounter += 1;
		
		// Save updated counter to localStorage
		localStorage.setItem('mfCounter', mfCounter.toString());
		
		// Generate MF number with 3-digit padding
		const mfNumber = `MF-${mfCounter.toString().padStart(3, '0')}`;
		
		console.log('New Counter (after increment):', mfCounter);
		console.log('Generated MF Number:', mfNumber);
		console.log('Next number will be:', `MF-${(mfCounter + 1).toString().padStart(3, '0')}`);
		
		return mfNumber;
	};

	// Function to reset MF counter (for testing purposes)
	const resetMFCounter = () => {
		localStorage.setItem('mfCounter', '0');
		console.log('MF Counter reset to 0');
		// Reload the page to update the display
		window.location.reload();
	};

	// Function to get current MF counter (for debugging)
	const getCurrentMFCounter = () => {
		const counter = parseInt(localStorage.getItem('mfCounter') || '0');
		console.log('Current MF Counter:', counter);
		return counter;
	};

	// Function to show MF number sequence (for debugging)
	const showMFSequence = () => {
		const counter = parseInt(localStorage.getItem('mfCounter') || '0');
		console.log('=== MF Number Sequence ===');
		console.log('Current Counter:', counter);
		console.log('Next Number:', `MF-${(counter + 1).toString().padStart(3, '0')}`);
		console.log('Starting from: MF-001');
		console.log('Sequence: MF-001, MF-002, MF-003, MF-004, MF-005...');
		console.log('Line by line: 001, 002, 003, 004, 005...');
		console.log('First user gets: MF-001');
		console.log('Second user gets: MF-002');
		console.log('Third user gets: MF-003');
	};

	const [addressData, setAddressData] = useState({
		addressLine1: '',
		addressLine2: '',
		landmark: '',
		city: '',
		state: '',
		pincode: '',
	});

	const [rateChartData, setRateChartData] = useState([
		{
			"name": "Bluedart",
			"chart": [
				{
					"Zone": "Z1",
					"minValue": 200,
					"minWeight": 500,
			"ODA": 10,
					"COD": 20,
					"otherCharges": 20
				},
				{
					"Zone": "Z2",
					"minValue": 400,
					"minWeight": 200,
					"ODA": 5,
					"COD": 5,
					"otherCharges": 5
				},
				{
					"Zone": "Z3",
					"minValue": 100,
					"minWeight": 100,
					"ODA": 1,
					"COD": 1,
					"otherCharges": 1
				},
				{
					"Zone": "Z4",
					"minValue": 500,
					"minWeight": 200,
					"ODA": 7,
					"COD": 7,
					"otherCharges": 7
				},
				{
					"Zone": "Z5",
					"minValue": 300,
					"minWeight": 400,
					"ODA": 5,
			"COD": 5,
					"otherCharges": 5
				}
			]	
		},
		{
			"name": "DTDC",
			"chart": [
				{
					"Zone": "Z1",
					"minValue": 220,
					"minWeight": 550,
					"ODA": 12,
					"COD": 22,
					"otherCharges": 22
				},
				{
					"Zone": "Z2",
					"minValue": 420,
					"minWeight": 220,
					"ODA": 8,
					"COD": 16,
					"otherCharges": 16
				},
				{
					"Zone": "Z3",
					"minValue": 110,
					"minWeight": 110,
					"ODA": 2,
					"COD": 2,
					"otherCharges": 2
				},
				{
					"Zone": "Z4",
					"minValue": 520,
					"minWeight": 220,
					"ODA": 8,
					"COD": 8,
					"otherCharges": 8
				},
				{
					"Zone": "Z5",
					"minValue": 320,
					"minWeight": 420,
					"ODA": 6,
					"COD": 6,
					"otherCharges": 6
				}
			]	
		},
		{
			"name": "Shree Maruthi",
			"chart": [
				{
					"Zone": "Z1",
					"minValue": 150,
					"minWeight": 400,
					"ODA": 8,
					"COD": 15,
					"otherCharges": 15
				},
				{
					"Zone": "Z2",
					"minValue": 300,
					"minWeight": 300,
					"ODA": 6,
					"COD": 12,
					"otherCharges": 12
				},
				{
					"Zone": "Z3",
					"minValue": 80,
					"minWeight": 80,
					"ODA": 2,
					"COD": 3,
					"otherCharges": 3
				},
				{
					"Zone": "Z4",
					"minValue": 400,
					"minWeight": 150,
					"ODA": 5,
					"COD": 8,
					"otherCharges": 8
				},
				{
					"Zone": "Z5",
					"minValue": 250,
					"minWeight": 350,
					"ODA": 4,
					"COD": 6,
					"otherCharges": 6
				}
			]	
		},
		{
			"name": "Tirupati",
			"chart": [
				{
					"Zone": "Z1",
					"minValue": 180,
					"minWeight": 450,
					"ODA": 9,
					"COD": 18,
					"otherCharges": 18
				},
				{
					"Zone": "Z2",
					"minValue": 350,
					"minWeight": 250,
					"ODA": 7,
					"COD": 14,
					"otherCharges": 14
				},
				{
					"Zone": "Z3",
					"minValue": 90,
					"minWeight": 90,
					"ODA": 3,
					"COD": 4,
					"otherCharges": 4
				},
				{
					"Zone": "Z4",
					"minValue": 450,
					"minWeight": 180,
					"ODA": 6,
					"COD": 9,
					"otherCharges": 9
				},
				{
					"Zone": "Z5",
					"minValue": 280,
					"minWeight": 380,
					"ODA": 5,
					"COD": 7,
					"otherCharges": 7
				}
			]	
		}
	]);

	// Zone Mapping Data
	const [zoneMapping, setZoneMapping] = useState({
		Z1: [],
		Z2: [],
		Z3: [],
		Z4: [],
		Z5: []
	});

	// Indian States Array
	const indianStates = [
		"Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
		"Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
		"Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
		"Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
		"Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
		"Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir",
		"Ladakh", "Puducherry"
	];

	const togglePasswordVisibility = () => setShowPassword(!showPassword);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleAddressChange = (e) => {
		setAddressData({ ...addressData, [e.target.name]: e.target.value });
	};

	const nextStep = () => {
		setCurrentStep(currentStep + 1);
		// Smooth scroll to top of form
		setTimeout(() => {
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		}, 100);
	};

	const prevStep = () => {
		setCurrentStep(currentStep - 1);
		// Smooth scroll to top of form
		setTimeout(() => {
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		}, 100);
	};

	const handleRateChartDataChange = useCallback((newRateChartData) => {
		setRateChartData(newRateChartData);
	}, []);

	// Zone Mapping Handlers
	const handleDragStart = (e, state) => {
		e.dataTransfer.setData('text/plain', state);
		e.dataTransfer.effectAllowed = 'move';
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	};

	const handleDrop = (e, targetZone) => {
		e.preventDefault();
		const state = e.dataTransfer.getData('text/plain');
		
		// Remove state from current zone
		const newZoneMapping = { ...zoneMapping };
		Object.keys(newZoneMapping).forEach(zone => {
			newZoneMapping[zone] = newZoneMapping[zone].filter(s => s !== state);
		});
		
		// Add state to target zone
		newZoneMapping[targetZone] = [...newZoneMapping[targetZone], state];
		setZoneMapping(newZoneMapping);
		
		// Console log the updated zone mapping
		console.log('Zone Mapping Updated:', newZoneMapping);
		console.log('States in each zone:');
		Object.keys(newZoneMapping).forEach(zone => {
			console.log(`${zone}: [${newZoneMapping[zone].join(', ')}]`);
		});
	};

	const removeStateFromZone = (state, zone) => {
		const newZoneMapping = { ...zoneMapping };
		newZoneMapping[zone] = newZoneMapping[zone].filter(s => s !== state);
		setZoneMapping(newZoneMapping);
		
		// Console log the updated zone mapping
		console.log('State removed from zone:', state, zone);
		console.log('Updated Zone Mapping:', newZoneMapping);
	};

	// Get available states (not assigned to any zone)
	const getAvailableStates = () => {
		const assignedStates = Object.values(zoneMapping).flat();
		return indianStates.filter(state => !assignedStates.includes(state));
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
				setOverlayStatus('loading');
				navigate('/userlist');
			}, 1500);
			return () => clearTimeout(t);
		}
		if (!loading && error) {
			setShowOverlay(false);
		}
	}, [loading, registerSuccess, error, navigate]);

	// Console log zone mapping changes
	useEffect(() => {
		console.log('Zone Mapping State Updated:', zoneMapping);
		console.log('Available States:', getAvailableStates());
	}, [zoneMapping]);

	// Load existing MF number from localStorage on component mount
	useEffect(() => {
		// Reset overlay state when component mounts
		setShowOverlay(false);
		setOverlayStatus('loading');
		
		// Initialize counter to 0 only if it doesn't exist
		if (!localStorage.getItem('mfCounter')) {
			localStorage.setItem('mfCounter', '0');
			console.log('Initialized MF Counter to 0 - Starting from MF-001');
		}
		
		const existingMFCounter = parseInt(localStorage.getItem('mfCounter') || '0');
		const nextMFNumber = `MF-${(existingMFCounter + 1).toString().padStart(3, '0')}`;
		
		setFormData(prev => ({
			...prev,
			mf_no: nextMFNumber
		}));
		
		console.log('=== MF Number Preview ===');
		console.log('Current MF Counter:', existingMFCounter);
		console.log('Next MF Number will be:', nextMFNumber);
		console.log('Sequence: MF-001, MF-002, MF-003, etc.');
		
		// Show the complete sequence for debugging
		showMFSequence();
	}, []);

	// Cleanup effect to reset overlay state when component unmounts
	useEffect(() => {
		return () => {
			setShowOverlay(false);
			setOverlayStatus('loading');
		};
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		setShowOverlay(true);
		setOverlayStatus('loading');
		
		// Generate MF number when form is submitted (for all roles)
		let finalFormData = { ...formData };
		const mfNumber = generateMFNumber();
		finalFormData.mf_no = mfNumber;
		console.log('Generated MF Number on submit:', mfNumber);
		
		// Convert rate chart data from array to object format for backend
		let rateChartForBackend = {};
		if (formData.role === 'Franchise' && Array.isArray(rateChartData)) {
			rateChartForBackend = rateChartData.reduce((acc, partner) => {
				acc[partner.name] = {
					chart: partner.chart || []
				};
				return acc;
			}, {});
		}

		// Combine user data, address data, rate chart data, and zone mapping
		const completeUserData = {
			...finalFormData,
			address: addressData,
			rate_chart: formData.role === 'Franchise' ? rateChartForBackend : {},
			zones: formData.role === 'Franchise' ? zoneMapping : {}
		};
		
		console.log('Submitting user data with MF number:', completeUserData.mf_no);
		dispatch(registerAdmin(completeUserData));
	};

	return (
		<>
			<style jsx>{`
				.hide-scrollbar::-webkit-scrollbar {
					display: none;
				}
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-fadeIn {
					animation: fadeIn 0.6s ease-out;
				}
				@keyframes slideIn {
					from {
						opacity: 0;
						transform: translateX(30px);
					}
					to {
						opacity: 1;
						transform: translateX(0);
					}
				}
				.animate-slideIn {
					animation: slideIn 0.5s ease-out;
				}
			`}</style>
			<div className="min-h-screen flex items-start justify-center px-4 py-8 bg-gradient-to-br from-gray-50 to-gray-100">
			<div className="w-full max-w-[400px] lg:max-w-6xl bg-white p-8 rounded-2xl border border-gray-200 shadow-2xl backdrop-blur-sm">
				{/* Header with Step Indicator */}
				<div className="mb-8 animate-slideIn">
					<h2 className="text-4xl font-bold text-center bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-6">
						Create New User
					</h2>
					
					{/* Step Indicator */}
					<div className="flex justify-start lg:justify-center mb-12">
						<div className="flex w-[400px] overflow-x-auto scrollbar-hide lg:w-auto gap-20 lg:justify-center justify-start items-center space-y-6 bg-gradient-to-b from-red-50 to-white p-3 rounded-2xl border border-red-100 shadow-lg">
							{/* Step 1 */}
							<div className="flex items-center flex-col gap-3 group">
								<div className="relative">
									<div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform ${
										currentStep >= 1 
											? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-110' 
											: 'bg-gray-200 text-gray-500 hover:bg-gray-300'
									} ${currentStep === 1 ? 'ring-4 ring-red-200 ring-opacity-50' : ''}`}>
										<UserIcon className="w-8 h-8" />
									</div>
									{/* Step Number */}
									
								</div>
								<div className="text-center">
									<span className={`text-lg font-bold transition-colors duration-300 ${
										currentStep >= 1 ? 'text-red-600' : 'text-gray-500'
									}`}>
										User
									</span>
									<br />
									<span className={`text-sm transition-colors duration-300 ${
										currentStep >= 1 ? 'text-red-500' : 'text-gray-400'
									}`}>
										Details
									</span>
								</div>
							</div>
							
							{/* Connector */}
							<div className={`w-1 h-8 rounded-full transition-all duration-500 ${
								currentStep >= 2 
									? 'bg-gradient-to-b from-red-500 to-red-600' 
									: 'bg-gray-200'
							}`}></div>
							
							{/* Step 2 */}
							<div className="flex items-center flex-col gap-3 group">
								<div className="relative">
									<div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform ${
										currentStep >= 2 
											? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-110' 
											: 'bg-gray-200 text-gray-500 hover:bg-gray-300'
									} ${currentStep === 2 ? 'ring-4 ring-red-200 ring-opacity-50' : ''}`}>
										<MapPinIcon className="w-8 h-8" />
									</div>
									{/* Step Number */}
									
								</div>
								<div className="text-center">
									<span className={`text-lg font-bold transition-colors duration-300 ${
										currentStep >= 2 ? 'text-red-600' : 'text-gray-500'
									}`}>
										Address
									</span>
									<br />
									<span className={`text-sm transition-colors duration-300 ${
										currentStep >= 2 ? 'text-red-500' : 'text-gray-400'
									}`}>
										Details
									</span>
								</div>
							</div>

							{/* Step 3 - Only show for Franchise role */}
							{formData.role === 'Franchise' && (
								<>
									{/* Connector */}
									<div className={`w-1 h-8 rounded-full transition-all duration-500 ${
										currentStep >= 3 
											? 'bg-gradient-to-b from-red-500 to-red-600' 
											: 'bg-gray-200'
									}`}></div>
									
									{/* Step 3 */}
									<div className="flex items-center flex-col gap-3 group">
										<div className="relative">
											<div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform ${
												currentStep >= 3 
													? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-110' 
													: 'bg-gray-200 text-gray-500 hover:bg-gray-300'
											} ${currentStep === 3 ? 'ring-4 ring-red-200 ring-opacity-50' : ''}`}>
												<DocumentChartBarIcon className="w-8 h-8" />
											</div>
											{/* Step Number */}
											
										</div>
										<div className="text-center">
											<span className={`text-lg font-bold transition-colors duration-300 ${
												currentStep >= 3 ? 'text-red-600' : 'text-gray-500'
											}`}>
												Rate Chart
											</span>
											<br />
											<span className={`text-sm transition-colors duration-300 ${
												currentStep >= 3 ? 'text-red-500' : 'text-gray-400'
											}`}>
												Upload
											</span>
										</div>
									</div>

									{/* Connector */}
									<div className={`w-1 h-8 rounded-full transition-all duration-500 ${
										currentStep >= 4 
											? 'bg-gradient-to-b from-red-500 to-red-600' 
											: 'bg-gray-200'
									}`}></div>
									
									{/* Step 4 */}
									<div className="flex items-center flex-col gap-3 group">
										<div className="relative">
											<div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform ${
												currentStep >= 4 
													? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-110' 
													: 'bg-gray-200 text-gray-500 hover:bg-gray-300'
											} ${currentStep === 4 ? 'ring-4 ring-red-200 ring-opacity-50' : ''}`}>
												<MapIcon className="w-8 h-8" />
											</div>
											{/* Step Number */}
											
										</div>
										<div className="text-center">
											<span className={`text-lg font-bold transition-colors duration-300 ${
												currentStep >= 4 ? 'text-red-600' : 'text-gray-500'
											}`}>
												Zone
											</span>
											<br />
											<span className={`text-sm transition-colors duration-300 ${
												currentStep >= 4 ? 'text-red-500' : 'text-gray-400'
											}`}>
												Mapping
											</span>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Step 1: User Details */}
					<div className={`transition-all duration-500 ease-in-out ${
						currentStep === 1 
							? 'opacity-100 transform translate-x-0' 
							: 'opacity-0 transform translate-x-8 absolute'
					}`}>
						{currentStep === 1 && (
							<div className="space-y-5 animate-fadeIn">
							{/* <div className="bg-gradient-to-r from-red-50 to-white p-4 rounded-lg border border-red-100 mb-6">
								<h3 className="text-lg font-semibold text-red-800 mb-2">Step 1: User Details</h3>
								<p className="text-sm text-red-600">Enter the basic user information</p>
							</div> */}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{[
									{ label: 'Full Name *', name: 'name', type: 'text' },
									{ label: 'Email Address *', name: 'email', type: 'email' },
									{ label: 'Phone Number *', name: 'phone', type: 'text' },
									{ label: 'GST Number *', name: 'gst_no', type: 'text' },
									{ label: 'Company Name *', name: 'co_name', type: 'text' },
									{ label: 'Company Location *', name: 'co_location', type: 'text' },
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
							</div>

							<div>
								<Select
									label="Select Role *"
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
								</Select>
							</div>

							<div className={`transition-all duration-300 overflow-hidden ${formData.role === 'Franchise' ? 'max-h-32 opacity-100 ' : 'max-h-0 opacity-0'}`}>
								{/* {formData.role === 'Franchise' && formData.mf_no && (
									<div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-semibold text-blue-800">
													📋 Next MF Number: <span className="font-bold text-blue-900">{formData.mf_no}</span>
												</p>
												<p className="text-xs text-blue-600 mt-1">
													Auto-increments after each user creation
												</p>
											</div>
											<button
												type="button"
												onClick={resetMFCounter}
												className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
											>
												Reset Counter
											</button>
										</div>
									</div>
								)} */}
								<Input
									id="mf_no"
									type="text"
									name="mf_no"
									label="MF Number *"
									value={formData.mf_no}
									disabled={true}
									className="!bg-gray-100 !text-gray-700 !border-gray-300"
									required={formData.role === 'Franchise'}
								/>
								<p className="text-xs text-gray-500 mt-1">
									Preview of next MF number (format: MF-001, MF-002, etc.) - Assigned on form submission
								</p>
							</div>

							<div>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? 'text' : 'password'}
										label="Password *"
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

							<div className="flex justify-end">
								<button
									type="button"
									onClick={nextStep}
									className="flex items-center px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
								>
									Next Step
									<ChevronRightIcon className="w-5 h-5 ml-2" />
								</button>
							</div>
						</div>
						)}
					</div>

					{/* Step 2: Address Details */}
					<div className={`transition-all duration-500 ease-in-out ${
						currentStep === 2 
							? 'opacity-100 transform translate-x-0' 
							: 'opacity-0 transform translate-x-8 absolute'
					}`}>
						{currentStep === 2 && (
							<div className="space-y-5 animate-fadeIn">
							{/* <div className="bg-gradient-to-r from-red-50 to-white p-4 rounded-lg border border-red-100 mb-6">
								<h3 className="text-lg font-semibold text-red-800 mb-2">Step 2: Address Details</h3>
								<p className="text-sm text-red-600">Enter the address information</p>
							</div> */}

							<div className="space-y-4">
								<Input
									id="addressLine1"
									type="text"
									name="addressLine1"
									label="Address Line 1 *"
									value={addressData.addressLine1}
									onChange={handleAddressChange}
									required
								/>

								<Input
									id="addressLine2"
									type="text"
									name="addressLine2"
									label="Address Line 2 *"
									value={addressData.addressLine2}
									onChange={handleAddressChange}
									required
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										id="landmark"
										type="text"
										name="landmark"
										label="Landmark *"
										value={addressData.landmark}
										onChange={handleAddressChange}
										required
									/>

									<Input
										id="city"
										type="text"
										name="city"
										label="City *"
										value={addressData.city}
										onChange={handleAddressChange}
										required
									/>
									<Input
										id="state"
										type="text"
										name="state"
										label="State *"
										value={addressData.state}
										onChange={handleAddressChange}
										required
									/>
								</div>

								<Input
									id="pincode"
									type="text"
									name="pincode"
									label="Pincode *"
									value={addressData.pincode}
									onChange={handleAddressChange}
									required
								/>
							</div>

							<div className="flex lg:flex-row flex-col gap-5 justify-between">
								<button
									type="button"
									onClick={prevStep}
									className="flex items-center px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 font-semibold"
								>
									<ChevronLeftIcon className="w-5 h-5 mr-2" />
									Previous Step
								</button>

								{formData.role === 'Franchise' ? (
									<button
										type="button"
										onClick={nextStep}
										className="flex items-center px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
									>
										Next Step
										<ChevronRightIcon className="w-5 h-5 ml-2" />
									</button>
								) : (
									<button
										type="submit"
										disabled={loading}
										className={`flex items-center px-8 py-3 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${loading
											? 'bg-red-300 cursor-not-allowed'
											: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
											}`}
									>
										{loading ? 'Registering...' : 'Register New User'}
										<UserIcon className="w-5 h-5 ml-2" />
									</button>
								)}
							</div>
						</div>
						)}
					</div>

					{/* Step 3: Rate Chart Upload - Only for Franchise */}
					<div className={`transition-all duration-500 ease-in-out ${
						currentStep === 3 && formData.role === 'Franchise'
							? 'opacity-100 transform translate-x-0' 
							: 'opacity-0 transform translate-x-8 absolute'
					}`}>
						{currentStep === 3 && formData.role === 'Franchise' && (
							<div className="space-y-5 animate-fadeIn">
							<RateChartManager 
								onDataChange={handleRateChartDataChange}
								initialData={rateChartData}
							/>

							{/* Navigation */}
							<div className="flex lg:flex-row flex-col gap-5 justify-between">
								<button
									type="button"
									onClick={prevStep}
									className="flex items-center px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 font-semibold"
								>
									<ChevronLeftIcon className="w-5 h-5 mr-2" />
									Previous Step
								</button>

								<button
									type="button"
									onClick={nextStep}
									className="flex items-center px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
								>
									Next Step
									<ChevronRightIcon className="w-5 h-5 ml-2" />
								</button>
							</div>
						</div>
						)}
					</div>

					{/* Step 4: Zone Mapping - Only for Franchise */}
					<div className={`transition-all duration-500 ease-in-out ${
						currentStep === 4 && formData.role === 'Franchise'
							? 'opacity-100 transform translate-x-0' 
							: 'opacity-0 transform translate-x-8 absolute'
					}`}>
						{currentStep === 4 && formData.role === 'Franchise' && (
							<div className="space-y-6 animate-fadeIn">
							{/* Header */}
							<div className="bg-gradient-to-r from-red-50 to-white p-4 rounded-lg border border-red-100">
								<h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center">
									<MapIcon className="w-5 h-5 mr-2" />
									Step 4: Zone Mapping
								</h3>
								<p className="text-sm text-red-600">Drag and drop Indian states into their respective zones</p>
							</div>

							{/* Available States */}
							<div className="bg-white p-8 border-2 border-red-500 shadow-2xl">
								<h4 className="text-2xl font-bold text-red-800 mb-6 flex items-center">
									<MapPinIcon className="w-7 h-7 mr-3" />
									Available States ({getAvailableStates().length})
								</h4>
								<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-5 gap-4">
									{getAvailableStates().map((state) => (
										<div
											key={state}
											draggable
											onDragStart={(e) => handleDragStart(e, state)}
											className="bg-white border-2 border-red-500 p-1 text-sm font-bold text-red-800 hover:bg-red-600 hover:text-white hover:border-red-700 cursor-move transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 text-center rounded-lg"
										>
											{state}
										</div>
									))}
								</div>
								{getAvailableStates().length === 0 && (
									<div className="text-center py-16 text-gray-600">
										<MapPinIcon className="w-16 h-16 mx-auto mb-6 text-gray-400" />
										<p className="text-xl font-bold">All states have been assigned to zones</p>
									</div>
								)}
							</div>

							{/* Zone Mapping Table */}
							<div className="space-y-6">
								<div className="bg-black p-2 border-2 border-red-500 shadow-2xl">

									<p className="text-red-200 font-bold text-lg">Drag states from above to assign them to zones below</p>
								</div>
								
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-6 h-[300px] overflow-y-scroll hide-scrollbar" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
									{['Z1', 'Z2', 'Z3', 'Z4', 'Z5'].map((zone, index) => {
										const zoneColors = [
											'bg-red-50 border-red-5		00 text-red-900',
											'bg-gray-100 border-gray-500 text-gray-900',
											'bg-red-100 border-red-600 text-red-900',
											'bg-gray-200 border-gray-600 text-gray-900',
											'bg-red-200 border-red-700 text-red-900'
										];
										
										const zoneIcons = [
											'bg-red-600 text-white border-red-700',
											'bg-black text-white border-gray-800',
											'bg-red-700 text-white border-red-800',
											'bg-gray-800 text-white border-gray-900',
											'bg-red-800 text-white border-red-900'
										];

										const zoneBorders = [
											'border-red-500 hover:border-red-600',
											'border-gray-500 hover:border-gray-600',
											'border-red-600 hover:border-red-700',
											'border-gray-600 hover:border-gray-700',
											'border-red-700 hover:border-red-800'
										];

										return (
											<div
												key={zone}
												className={`border-2 border-dashed p-6 min-h-[350px] transition-all duration-200 hover:shadow-2xl hover:scale-105 ${zoneColors[index]} ${zoneBorders[index]}`}
												onDragOver={handleDragOver}
												onDrop={(e) => handleDrop(e, zone)}
											>
												<div className="flex items-center justify-between mb-6">
													<div className={`px-3 py-1 rounded-lg text-lg font-bold border-2 ${zoneIcons[index]}`}>
														{zone}
													</div>
													
												</div>
												
												<div className="space-y-3 max-h-[220px] overflow-y-auto hide-scrollbar" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
													{zoneMapping[zone].length === 0 ? (
														<div className="text-center py-12">
															<MapIcon className="w-12 h-12 mx-auto mb-4 text-gray-500" />
															<p className="text-sm text-gray-600 font-bold">
																Drop states here
															</p>
														</div>
													) : (
														zoneMapping[zone].map((state) => (
															<div
																key={state}
																className="flex items-center justify-between bg-white py-1 px-2  text-sm shadow-lg border-2 border-gray-200 hover:shadow-xl hover:border-red-300 transition-all duration-200"
															>
																<span className="font-bold text-gray-800 flex-1 truncate">{state}</span>
																<button
																	type="button"
																	onClick={() => removeStateFromZone(state, zone)}
																	className="text-gray-500 hover:text-red-600 transition-colors duration-200 ml-3 flex-shrink-0 p-2 hover:bg-red-50"
																	title="Remove from zone"
																>
																	<XMarkIcon className="w-3 h-3" />
																</button>
															</div>
														))
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>

							{/* Navigation */}
							<div className="flex lg:flex-row flex-col gap-5 justify-between">
								<button
									type="button"
									onClick={prevStep}
									className="flex items-center px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 font-semibold"
								>
									<ChevronLeftIcon className="w-5 h-5 mr-2" />
									Previous Step
								</button>

								<button
									type="submit"
									disabled={loading}
									className={`flex items-center px-8 py-3 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
										loading
										? 'bg-red-300 cursor-not-allowed'
										: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
									}`}
								>
									{loading ? 'Registering...' : 'Register New User'}
									<UserIcon className="w-5 h-5 ml-2" />
								</button>
							</div>
						</div>
						)}
					</div>
				</form>
			</div>

			{showOverlay && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
					<div className="bg-white rounded-2xl p-8 shadow-2xl w-[90%] max-w-md text-center relative">
						{/* Close button for success popup */}
						{overlayStatus === 'success' && (
							<button
								onClick={() => {
									setShowOverlay(false);
									setOverlayStatus('loading');
									navigate('/userlist');
								}}
								className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
							>
								<XMarkIcon className="w-6 h-6" />
							</button>
						)}
						
						{overlayStatus === 'loading' && (
							<div className="flex flex-col items-center">
								<div className="h-16 w-16 rounded-full border-4 border-red-200 border-t-red-600 animate-spin mb-4"></div>
								<p className="text-gray-700 text-lg font-semibold">Creating user...</p>
								<p className="text-gray-500 text-sm mt-2">Please wait while we process your request</p>
							</div>
						)}
						{overlayStatus === 'success' && (
							<div className="flex flex-col items-center">
								<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
									<CheckCircleIcon className="w-12 h-12 text-green-500" />
								</div>
								<h3 className="text-xl font-bold text-gray-800 mb-2">Success!</h3>
								<p className="text-gray-600 text-lg mb-4">User created successfully</p>
								<p className="text-gray-500 text-sm">Redirecting to user list...</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
		</>
	);
};

export default MultiStepUserForm;

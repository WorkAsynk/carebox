import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Option, Select } from '@material-tailwind/react';
import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon, MapPinIcon, DocumentChartBarIcon, MapIcon, XMarkIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import RateChartManager from '../RateChartManager/RateChartManager';

const EditUserForm = () => {
	const { id } = useParams();
	const dispatch = useDispatch();
	const { loading } = useSelector((state) => state.auth);
	const [showPassword, setShowPassword] = useState(false);
	const [showOverlay, setShowOverlay] = useState(false);
	const [overlayStatus, setOverlayStatus] = useState('loading'); // 'loading' | 'success'
	const [isLoading, setIsLoading] = useState(false);
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
			"min-weight": 500,
			"ODA": 10,
					"COD": 20,
					"otherCharges": 20
				},
				{
					"Zone": "Z1",
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
			"name": "Shree Maruthi",
			"chart": [
				{
					"Zone": "Z1",
					"minValue": 150,
			"min-weight": 400,
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
			"min-weight": 450,
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
		},
		{
			"name": "DTDC",
			"chart": [
				{
					"Zone": "Z1",
					"minValue": 220,
			"min-weight": 550,
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
		}
	]);

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

	// Zone Mapping State
	const [zoneMapping, setZoneMapping] = useState({
		Z1: [],
		Z2: [],
		Z3: [],
		Z4: [],
		Z5: []
	});

	// Indian States Array
	const indianStates = [
		'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
		'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
		'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
		'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
		'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
		'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
		'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
	];

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

	const handleDrop = (e, zone) => {
		e.preventDefault();
		const state = e.dataTransfer.getData('text/plain');
		
		// Remove state from current zone if it exists
		const newZoneMapping = { ...zoneMapping };
		Object.keys(newZoneMapping).forEach(z => {
			newZoneMapping[z] = newZoneMapping[z].filter(s => s !== state);
		});
		
		// Add state to new zone
		newZoneMapping[zone].push(state);
		setZoneMapping(newZoneMapping);
		
		console.log('Zone Mapping Updated:', newZoneMapping);
		console.log('Available States:', getAvailableStates());
	};

	const removeStateFromZone = (state, zone) => {
		const newZoneMapping = { ...zoneMapping };
		newZoneMapping[zone] = newZoneMapping[zone].filter(s => s !== state);
		setZoneMapping(newZoneMapping);
		
		console.log('State removed from zone:', state, zone);
		console.log('Updated Zone Mapping:', newZoneMapping);
		console.log('Available States:', getAvailableStates());
	};

	const getAvailableStates = () => {
		const assignedStates = Object.values(zoneMapping).flat();
		return indianStates.filter(state => !assignedStates.includes(state));
	};

	// Console log zone mapping changes
	useEffect(() => {
		console.log('Zone Mapping State Updated:', zoneMapping);
		console.log('Available States:', getAvailableStates());
	}, [zoneMapping]);

	// Fetch user data on component mount
	useEffect(() => {
		const fetchUser = async () => {
			try {
				setIsLoading(true);
				const response = await axios.post(buildApiUrl(API_ENDPOINTS.GET_USER), {
					id: id
				});
				const userData = response.data.user;
				
				// Set user data
				setFormData({
					name: userData.name || '',
					email: userData.email || '',
					phone: userData.phone || '',
					gst_no: userData.gst_no || '',
					co_name: userData.co_name || '',
					co_location: userData.co_location || '',
					role: userData.role || '',
					mf_no: userData.mf_no || '',
					password: '', // Don't pre-fill password for security
				});

				// Set address data if available
				if (userData.address) {
					setAddressData({
						addressLine1: userData.address.addressLine1 || '',
						addressLine2: userData.address.addressLine2 || '',
						landmark: userData.address.landmark || '',
						city: userData.address.city || '',
						pincode: userData.address.pincode || '',
					});
				}

				// Set rate chart data if user is Franchise
				if (userData.role === 'Franchise') {
					if (userData.rate_chart) {
						// Convert object format to array format if needed
						if (Array.isArray(userData.rate_chart)) {
							setRateChartData(userData.rate_chart);
						} else if (typeof userData.rate_chart === 'object' && userData.rate_chart !== null) {
							// Convert object format to array format
							const rateChartArray = Object.entries(userData.rate_chart).map(([partnerName, partnerData]) => ({
								name: partnerName,
								chart: partnerData.chart || []
							}));
							setRateChartData(rateChartArray);
						}
					} else {
						// If no rate chart data, provide default data with Z1-Z5 for all partners
						const defaultRateChartData = [
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
						];
						setRateChartData(defaultRateChartData);
					}
				}

				// Set zone mapping data if user is Franchise
				if (userData.role === 'Franchise') {
					if (userData.zones) {
						// Map the zones data to our zone mapping state
						const mappedZones = {
							Z1: userData.zones.Z1 || [],
							Z2: userData.zones.Z2 || [],
							Z3: userData.zones.Z3 || [],
							Z4: userData.zones.Z4 || [],
							Z5: userData.zones.Z5 || []
						};
						setZoneMapping(mappedZones);
						console.log('Zone mapping data loaded:', mappedZones);
					} else {
						// If no zone mapping data, initialize with empty arrays
						setZoneMapping({
							Z1: [],
							Z2: [],
							Z3: [],
							Z4: [],
							Z5: []
						});
						console.log('No zone mapping data found, initialized with empty arrays');
					}
				}

				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching user:', error);
				setIsLoading(false);
			}
		};

		if (id) {
			fetchUser();
		}
	}, [id]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			setShowOverlay(true);
			setOverlayStatus('loading');
			
			// Create update data (exclude password if empty)
			const updateData = { ...formData };
			if (!updateData.password) {
				delete updateData.password;
			}

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
				user_id: id,
				...updateData,
				address: addressData,
				rate_chart: formData.role === 'Franchise' ? rateChartForBackend : {},
				zones: formData.role === 'Franchise' ? zoneMapping : {}
			};

			await axios.post(buildApiUrl(API_ENDPOINTS.EDIT_USER), completeUserData);
			
			setOverlayStatus('success');
			setTimeout(() => {
				setShowOverlay(false);
				navigate('/userlist');
			}, 800);
		} catch (error) {
			console.error('Error updating user:', error);
			setShowOverlay(false);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center px-4 py-8">
				<div className="flex flex-col items-center">
					<div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin mb-3"></div>
					<p className="text-gray-700 text-sm">Loading user data...</p>
				</div>
			</div>
		);
	}

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
			<div className="w-full max-w-6xl bg-white p-8 rounded-2xl border border-gray-200 shadow-2xl backdrop-blur-sm">
				{/* Header with Step Indicator */}
				<div className="mb-8 animate-slideIn">
					<h2 className="text-4xl font-bold text-center bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-6">
						Edit User
					</h2>
					
					{/* Step Indicator */}
					<div className="flex justify-center mb-12">
						<div className="flex w-full gap-20 justify-center items-center space-y-6 bg-gradient-to-b from-red-50 to-white p-3 rounded-2xl border border-red-100 shadow-lg">
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
												Update
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

							<div className={`transition-all duration-300 overflow-hidden ${formData.role === 'Franchise' ? 'max-h-28 opacity-100 ' : 'max-h-0 opacity-0'}`}>
								<Input
									id="mf_no"
									type="number"
									name="mf_no"
									label="MF Number *"
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
										label="Password (leave empty to keep current)"
										name="password"
										value={formData.password}
										onChange={handleChange}
										placeholder="Enter new password or leave empty"
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
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<Input
										id="state"
										type="text"
										name="state"
										label="State *"
										value={addressData.state}
										onChange={handleAddressChange}
										required
									/>

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
							</div>

							<div className="flex justify-between">
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
										{loading ? 'Updating...' : 'Update User'}
										<UserIcon className="w-5 h-5 ml-2" />
									</button>
								)}
							</div>
						</div>
						)}
					</div>

					{/* Step 3: Rate Chart Update - Only for Franchise */}
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
							<div className="flex justify-between">
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
								{isLoading ? (
									<div className="flex flex-col items-center justify-center py-12">
										<div className="h-12 w-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin mb-4"></div>
										<p className="text-gray-700 text-lg font-semibold">Loading zone mapping data...</p>
										<p className="text-gray-500 text-sm mt-2">Please wait while we fetch your zone assignments</p>
									</div>
								) : (
									<>
									{/* Header */}
							<div className="bg-gradient-to-r from-red-50 to-white p-4 rounded-lg border border-red-100">
								<h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center">
									<MapIcon className="w-5 h-5 mr-2" />
									Step 4: Zone Mapping
								</h3>
								<p className="text-sm text-red-600">Drag and drop Indian states into their respective zones</p>
								
								{/* Data Status Indicator */}
								{/* <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
											<span className="text-sm font-medium text-blue-800">
												Zone Data: {Object.values(zoneMapping).flat().length > 0 ? 'Loaded' : 'Empty'}
											</span>
										</div>
										<span className="text-xs text-blue-600">
											{Object.values(zoneMapping).flat().length} states assigned
										</span>
									</div>
								</div> */}
							</div>

							{/* Available States */}
							<div className="bg-white p-8 border-2 border-red-500 shadow-2xl">
								<h4 className="text-2xl font-bold text-red-800 mb-6 flex items-center">
									<MapPinIcon className="w-7 h-7 mr-3" />
									Available States ({getAvailableStates().length})
								</h4>
								<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3">
									{getAvailableStates().map((state, index) => (
										<div
											key={state}
											draggable
											onDragStart={(e) => handleDragStart(e, state)}
											className="bg-white border-2 border-red-500 p-1 text-sm font-bold text-red-800 hover:bg-red-600 hover:text-white hover:border-red-700 cursor-move transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 text-center rounded-lg"
										>
											{state}
										</div>
									))}
									{getAvailableStates().length === 0 && (
										<div className="col-span-full text-center py-8 text-gray-500">
											<p className="text-lg font-semibold">All states have been assigned to zones!</p>
											<p className="text-sm mt-2">Remove states from zones to make them available again.</p>
										</div>
									)}
								</div>
							</div>

							{/* Zone Mapping */}
							<div className="bg-white p-6 rounded-xl border-2 border-red-500 shadow-xl">
								
								<p className="text-black mb-6 text-center">Drag states from above to assign them to zones below</p>
								<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 h-[300px] overflow-y-scroll hide-scrollbar">
									{Object.keys(zoneMapping).map((zone, index) => {
										const zoneStyles = [
											{ bg: 'bg-red-100', border: 'border-red-500', badge: 'bg-red-500' },
											{ bg: 'bg-gray-100', border: 'border-gray-500', badge: 'bg-black' },
											{ bg: 'bg-red-100', border: 'border-red-500', badge: 'bg-red-500' },
											{ bg: 'bg-gray-100', border: 'border-gray-500', badge: 'bg-black' },
											{ bg: 'bg-red-100', border: 'border-red-500', badge: 'bg-red-500' }
										];
										const style = zoneStyles[index] || zoneStyles[0];
										
										return (
											<div
												key={zone}
												className={`${style.bg} border-2 border-dashed ${style.border} p-6 min-h-[300px] transition-all duration-200 hover:shadow-2xl hover:scale-105 rounded-lg relative`}
												onDragOver={handleDragOver}
												onDrop={(e) => handleDrop(e, zone)}
											>
												{/* Zone Badge */}
												<div className={`absolute top-4 left-4 ${style.badge} text-white px-3 py-1 rounded-lg text-sm font-bold`}>
													{zone}
												</div>
												
												{/* Centered Content */}
												<div className="flex flex-col items-center justify-center h-full pt-8">
													<MapIcon className="w-12 h-12 text-gray-500 mb-4" />
													<p className="text-gray-500 text-sm">Drop states here</p>
												</div>
												
												{/* Assigned States */}
												{zoneMapping[zone].length > 0 && (
													<div className="absolute bottom-4 left-4 right-4 max-h-[220px] overflow-y-auto hide-scrollbar">
														<div className="space-y-2">
															{zoneMapping[zone].map((state, stateIndex) => (
																<div
																	key={`${zone}-${stateIndex}`}
																	className="bg-white border-2 border-red-500 p-2 rounded-lg flex items-center justify-between group"
																>
																	<span className="text-sm font-medium text-black">{state}</span>
																	<button
																		type="button"
																		onClick={() => removeStateFromZone(state, zone)}
																		className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity duration-200 p-1"
																	>
																		<XMarkIcon className="w-3 h-3" />
																	</button>
																</div>
															))}
														</div>
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>

							{/* Navigation */}
							<div className="flex justify-between">
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
									{loading ? 'Updating...' : 'Update User'}
									<UserIcon className="w-5 h-5 ml-2" />
								</button>
							</div>
									</>
								)}
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
								<p className="text-gray-700 text-lg font-semibold">Updating user...</p>
								<p className="text-gray-500 text-sm mt-2">Please wait while we process your request</p>
							</div>
						)}
						{overlayStatus === 'success' && (
							<div className="flex flex-col items-center">
								<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
									<CheckCircleIcon className="w-12 h-12 text-green-500" />
								</div>
								<h3 className="text-xl font-bold text-gray-800 mb-2">Success!</h3>
								<p className="text-gray-600 text-lg mb-4">User updated successfully</p>
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

export default EditUserForm;

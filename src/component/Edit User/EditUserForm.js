import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Option, Select } from '@material-tailwind/react';
import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon, MapPinIcon, DocumentChartBarIcon, ArrowDownTrayIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';

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
		pincode: '',
	});

	const [rateChartData, setRateChartData] = useState({
		"bluedart": {
			"min-weight": 500,
			"min-value": 200,
			"ODA": "10%",
			"COD": "5%",
			"Other Charges": "10%"
		},
		"dtdc": {
			"min-weight": 500,
			"min-value": 200,
			"ODA": "10%",
			"COD": "5%",
			"Other Charges": "10%"
		},
		"Shree Maurthi": {
			"min-weight": 500,
			"min-value": 200,
			"ODA": "10%",
			"COD": "5%",
			"Other Charges": "10%"
		},
		"Tirupati": {
			"min-weight": 500,
			"min-value": 200,
			"ODA": "10%",
			"COD": "5%",
			"Other Charges": "10%"
		}
	});

	const [rateChartMethod, setRateChartMethod] = useState('table'); // 'csv' or 'table'
	const [csvFile, setCsvFile] = useState(null);

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

	const handleRateChartChange = (courierName, field, value) => {
		if (field === 'ratechart') {
			// Handle courier name change - rename the key
			const updatedData = { ...rateChartData };
			const courierData = updatedData[courierName];
			delete updatedData[courierName];
			updatedData[value] = courierData;
			setRateChartData(updatedData);
		} else {
			// Handle other field changes
			setRateChartData({
				...rateChartData,
				[courierName]: {
					...rateChartData[courierName],
					[field]: value
				}
			});
		}
	};

	const addRateChartRow = () => {
		const newCourierName = `Courier_${Object.keys(rateChartData).length + 1}`;
		setRateChartData({
			...rateChartData,
			[newCourierName]: {
				"min-weight": 500,
				"min-value": 200,
				"ODA": "10%",
				"COD": "5%",
				"Other Charges": "10%"
			}
		});
	};

	const removeRateChartRow = (courierName) => {
		if (Object.keys(rateChartData).length > 1) {
			const updatedData = { ...rateChartData };
			delete updatedData[courierName];
			setRateChartData(updatedData);
		}
	};

	const handleCsvUpload = (e) => {
		const file = e.target.files[0];
		setCsvFile(file);
	};

	const downloadSampleCSV = () => {
		const csvContent = "ratechart,min-weight,min-value,ODA,COD,Other Charges\n" +
			"bluedart,500,200,10%,5%,10%\n" +
			"dtdc,500,200,10%,5%,10%\n" +
			"Shree Maurthi,500,200,10%,5%,10%\n" +
			"Tirupati,500,200,10%,5%,10%";
		
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'sample_ratechart.csv';
		a.click();
		window.URL.revokeObjectURL(url);
	};

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

				// Set rate chart data if available and user is Franchise
				if (userData.role === 'Franchise' && userData.rate_chart && Object.keys(userData.rate_chart).length > 0) {
					setRateChartData(userData.rate_chart);
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

			// Combine user data, address data, and rate chart data
			const completeUserData = {
				user_id: id,
				...updateData,
				address: addressData,
				rate_chart: formData.role === 'Franchise' ? rateChartData : {}
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
		<div className="min-h-screen flex items-center justify-center px-4 py-8">
			<div className="w-full max-w-2xl bg-white p-8 rounded-xl border border-gray-200 shadow-lg">
				{/* Header with Step Indicator */}
				<div className="mb-8">
					<h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
						Edit User
					</h2>
					
					{/* Step Indicator */}
					<div className="flex items-center justify-center mb-6">
						<div className="flex items-center space-x-4">
							{/* Step 1 */}
							<div className="flex items-center">
								<div className={`w-10 h-10 rounded-full flex items-center justify-center ${
									currentStep >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
								}`}>
									<UserIcon className="w-5 h-5" />
								</div>
								<span className={`ml-2 text-sm font-medium ${
									currentStep >= 1 ? 'text-red-600' : 'text-gray-500'
								}`}>
									User Details
								</span>
							</div>
							
							{/* Connector */}
							<div className={`w-8 h-1 ${currentStep >= 2 ? 'bg-red-600' : 'bg-gray-200'}`}></div>
							
							{/* Step 2 */}
							<div className="flex items-center">
								<div className={`w-10 h-10 rounded-full flex items-center justify-center ${
									currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
								}`}>
									<MapPinIcon className="w-5 h-5" />
								</div>
								<span className={`ml-2 text-sm font-medium ${
									currentStep >= 2 ? 'text-red-600' : 'text-gray-500'
								}`}>
									Address Details
								</span>
							</div>

							{/* Step 3 - Only show for Franchise role */}
							{formData.role === 'Franchise' && (
								<>
									{/* Connector */}
									<div className={`w-8 h-1 ${currentStep >= 3 ? 'bg-red-600' : 'bg-gray-200'}`}></div>
									
									{/* Step 3 */}
									<div className="flex items-center">
										<div className={`w-10 h-10 rounded-full flex items-center justify-center ${
											currentStep >= 3 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
										}`}>
											<DocumentChartBarIcon className="w-5 h-5" />
										</div>
										<span className={`ml-2 text-sm font-medium ${
											currentStep >= 3 ? 'text-red-600' : 'text-gray-500'
										}`}>
											Rate Chart Update
										</span>
									</div>
								</>
							)}
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Step 1: User Details */}
					{currentStep === 1 && (
						<div className="space-y-5">
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
									className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
								>
									Next Step
									<ChevronRightIcon className="w-4 h-4 ml-2" />
								</button>
							</div>
						</div>
					)}

					{/* Step 2: Address Details */}
					{currentStep === 2 && (
						<div className="space-y-5">
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

							<div className="flex justify-between">
								<button
									type="button"
									onClick={prevStep}
									className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
								>
									<ChevronLeftIcon className="w-4 h-4 mr-2" />
									Previous Step
								</button>

								{formData.role === 'Franchise' ? (
									<button
										type="button"
										onClick={nextStep}
										className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
									>
										Next Step
										<ChevronRightIcon className="w-4 h-4 ml-2" />
									</button>
								) : (
									<button
										type="submit"
										disabled={loading}
										className={`flex items-center px-6 py-2 rounded-lg text-white font-semibold transition duration-200 ${loading
											? 'bg-red-300 cursor-not-allowed'
											: 'bg-red-600 hover:bg-red-700'
											}`}
									>
										{loading ? 'Updating...' : 'Update User'}
										<UserIcon className="w-4 h-4 ml-2" />
									</button>
								)}
							</div>
						</div>
					)}

					{/* Step 3: Rate Chart Update - Only for Franchise */}
					{currentStep === 3 && formData.role === 'Franchise' && (
						<div className="space-y-5">
							{/* Method Selection */}
							<div className="bg-white border border-gray-200 rounded-lg p-6">
								<h4 className="text-lg font-semibold text-gray-800 mb-4">Choose Rate Chart Method</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* CSV Upload Option */}
									<div 
										className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
											rateChartMethod === 'csv' 
											? 'border-red-500 bg-red-50' 
											: 'border-gray-200 hover:border-red-300'
										}`}
										onClick={() => setRateChartMethod('csv')}
									>
										<div className="flex items-center space-x-3">
											<ArrowDownTrayIcon className="w-6 h-6 text-red-600" />
											<div>
												<h5 className="font-semibold text-gray-800">Upload CSV</h5>
												<p className="text-sm text-gray-600">Upload rate chart from CSV file</p>
											</div>
										</div>
									</div>

									{/* Table Update Option */}
									<div 
										className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
											rateChartMethod === 'table' 
											? 'border-red-500 bg-red-50' 
											: 'border-gray-200 hover:border-red-300'
										}`}
										onClick={() => setRateChartMethod('table')}
									>
										<div className="flex items-center space-x-3">
											<DocumentChartBarIcon className="w-6 h-6 text-red-600" />
											<div>
												<h5 className="font-semibold text-gray-800">Update Table</h5>
												<p className="text-sm text-gray-600">Manually update rate chart table</p>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* CSV Upload Section */}
							{rateChartMethod === 'csv' && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<h4 className="text-lg font-semibold text-gray-800 mb-4">CSV Upload</h4>
									
									{/* Sample CSV Download */}
									<div className="mb-4">
										<button
											type="button"
											onClick={downloadSampleCSV}
											className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
										>
											<ArrowDownTrayIcon className="w-4 h-4 mr-2" />
											Download Sample CSV
										</button>
									</div>

									{/* File Upload */}
									<div className="space-y-2">
										<label className="block text-sm font-medium text-gray-700">
											Upload Rate Chart CSV
										</label>
										<input
											type="file"
											accept=".csv"
											onChange={handleCsvUpload}
											className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
										/>
										{csvFile && (
											<p className="text-sm text-green-600">
												Selected: {csvFile.name}
											</p>
										)}
									</div>
								</div>
							)}

							{/* Table Update Section */}
							{rateChartMethod === 'table' && (
								<div className="bg-white border border-gray-200 rounded-lg p-6">
									<div className="flex justify-between items-center mb-4">
										<h4 className="text-lg font-semibold text-gray-800">Rate Chart Table</h4>
										<button
											type="button"
											onClick={addRateChartRow}
											className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
										>
											<PlusIcon className="w-4 h-4 mr-2" />
											Add Row
										</button>
									</div>

									{/* Table */}
									<div className="overflow-x-auto">
										<table className="w-full border border-gray-200 rounded-lg">
											<thead className="bg-gray-50">
												<tr>
													<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Rate Chart</th>
													<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Min Weight</th>
													<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Min Value</th>
													<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">ODA</th>
													<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">COD</th>
													<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Other Charges</th>
													<th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Action</th>
												</tr>
											</thead>
											<tbody>
												{Object.entries(rateChartData).map(([courierName, courierData]) => (
													<tr key={courierName} className="border-b hover:bg-gray-50">
														<td className="px-4 py-3">
															<Input
																type="text"
																value={courierName}
																onChange={(e) => handleRateChartChange(courierName, 'ratechart', e.target.value)}
																placeholder="e.g., bluedart"
																required
															/>
														</td>
														<td className="px-4 py-3">
															<Input
																type="number"
																value={courierData['min-weight']}
																onChange={(e) => handleRateChartChange(courierName, 'min-weight', parseInt(e.target.value) || 0)}
																placeholder="500"
																required
															/>
														</td>
														<td className="px-4 py-3">
															<Input
																type="number"
																value={courierData['min-value']}
																onChange={(e) => handleRateChartChange(courierName, 'min-value', parseInt(e.target.value) || 0)}
																placeholder="200"
																required
															/>
														</td>
														<td className="px-4 py-3">
															<Input
																type="text"
																value={courierData.ODA}
																onChange={(e) => handleRateChartChange(courierName, 'ODA', e.target.value)}
																placeholder="10%"
																required
															/>
														</td>
														<td className="px-4 py-3">
															<Input
																type="text"
																value={courierData.COD}
																onChange={(e) => handleRateChartChange(courierName, 'COD', e.target.value)}
																placeholder="5%"
																required
															/>
														</td>
														<td className="px-4 py-3">
															<Input
																type="text"
																value={courierData['Other Charges']}
																onChange={(e) => handleRateChartChange(courierName, 'Other Charges', e.target.value)}
																placeholder="10%"
																required
															/>
														</td>
														<td className="px-4 py-3">
															<button
																type="button"
																onClick={() => removeRateChartRow(courierName)}
																disabled={Object.keys(rateChartData).length <= 1}
																className={`p-2 rounded-lg transition duration-200 ${
																	Object.keys(rateChartData).length <= 1 
																	? 'text-gray-400 cursor-not-allowed' 
																	: 'text-red-600 hover:bg-red-50'
																}`}
															>
																<TrashIcon className="w-4 h-4" />
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							)}

							{/* Navigation */}
							<div className="flex justify-between">
								<button
									type="button"
									onClick={prevStep}
									className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
								>
									<ChevronLeftIcon className="w-4 h-4 mr-2" />
									Previous Step
								</button>

								<button
									type="submit"
									disabled={loading || (rateChartMethod === 'csv' && !csvFile)}
									className={`flex items-center px-6 py-2 rounded-lg text-white font-semibold transition duration-200 ${
										loading || (rateChartMethod === 'csv' && !csvFile)
										? 'bg-red-300 cursor-not-allowed'
										: 'bg-red-600 hover:bg-red-700'
									}`}
								>
									{loading ? 'Updating...' : 'Update User'}
									<UserIcon className="w-4 h-4 ml-2" />
								</button>
							</div>
						</div>
					)}
				</form>
			</div>

			{showOverlay && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
						{overlayStatus === 'loading' && (
							<div className="flex flex-col items-center">
								<div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin mb-3"></div>
								<p className="text-gray-700 text-sm">Updating user...</p>
							</div>
						)}
						{overlayStatus === 'success' && (
							<div className="flex flex-col items-center">
								<CheckCircleIcon className="w-14 h-14 text-green-500" />
								<p className="text-gray-700 text-sm mt-2">User updated successfully</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default EditUserForm;

import React, { useState } from 'react';
import { FaTruck, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import { Input } from '@material-tailwind/react';
import { Autocomplete, TextField } from '@mui/material';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AssignDeliveryBoy = () => {
	const navigate = useNavigate();
	
	// Static delivery boys data
	const deliveryBoys = [
		{ id: 1, name: 'Rajesh Kumar', phone: '9876543210', vehicleNumber: 'MH01AB1234' },
		{ id: 2, name: 'Amit Singh', phone: '9876543211', vehicleNumber: 'MH02CD5678' },
		{ id: 3, name: 'Suresh Sharma', phone: '9876543212', vehicleNumber: 'MH03EF9012' },
		{ id: 4, name: 'Ramesh Patel', phone: '9876543213', vehicleNumber: 'MH04GH3456' },
		{ id: 5, name: 'Vijay Verma', phone: '9876543214', vehicleNumber: 'MH05IJ7890' },
		{ id: 6, name: 'Anil Joshi', phone: '9876543215', vehicleNumber: 'MH06KL1234' },
		{ id: 7, name: 'Manoj Gupta', phone: '9876543216', vehicleNumber: 'MH07MN5678' },
		{ id: 8, name: 'Prakash Yadav', phone: '9876543217', vehicleNumber: 'MH08OP9012' },
	];

	// Static LR numbers data
	const availableLRNumbers = [
		{ id: 1, lrNumber: 'LR001234', destination: 'Mumbai', weight: '25 kg' },
		{ id: 2, lrNumber: 'LR001235', destination: 'Delhi', weight: '30 kg' },
		{ id: 3, lrNumber: 'LR001236', destination: 'Bangalore', weight: '20 kg' },
		{ id: 4, lrNumber: 'LR001237', destination: 'Chennai', weight: '15 kg' },
		{ id: 5, lrNumber: 'LR001238', destination: 'Kolkata', weight: '28 kg' },
		{ id: 6, lrNumber: 'LR001239', destination: 'Hyderabad', weight: '22 kg' },
		{ id: 7, lrNumber: 'LR001240', destination: 'Pune', weight: '18 kg' },
		{ id: 8, lrNumber: 'LR001241', destination: 'Ahmedabad', weight: '35 kg' },
	];

	const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
	const [vehicleNumber, setVehicleNumber] = useState('');
	const [selectedLRNumbers, setSelectedLRNumbers] = useState([]);
	const [searchLR, setSearchLR] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Auto-fill vehicle number when delivery boy is selected
	const handleDeliveryBoyChange = (event, newValue) => {
		setSelectedDeliveryBoy(newValue);
		if (newValue) {
			setVehicleNumber(newValue.vehicleNumber);
		} else {
			setVehicleNumber('');
		}
	};

	// Add LR number to selected list
	const handleAddLR = (lr) => {
		if (!selectedLRNumbers.find(item => item.id === lr.id)) {
			setSelectedLRNumbers([...selectedLRNumbers, lr]);
			toast.success(`LR ${lr.lrNumber} added successfully!`);
		} else {
			toast.warning(`LR ${lr.lrNumber} already added!`);
		}
	};

	// Remove LR number from selected list
	const handleRemoveLR = (lrId) => {
		setSelectedLRNumbers(selectedLRNumbers.filter(lr => lr.id !== lrId));
		toast.info('LR removed from list');
	};

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();
		
		if (!selectedDeliveryBoy) {
			toast.error('Please select a delivery boy');
			return;
		}
		
		if (!vehicleNumber) {
			toast.error('Please enter vehicle number');
			return;
		}
		
		if (selectedLRNumbers.length === 0) {
			toast.error('Please add at least one LR number');
			return;
		}

		setIsSubmitting(true);
		
		// Simulate API call
		setTimeout(() => {
			toast.success('Delivery boy assigned successfully!');
			setIsSubmitting(false);
			// Reset form
			setSelectedDeliveryBoy(null);
			setVehicleNumber('');
			setSelectedLRNumbers([]);
		}, 1500);
	};

	// Filter available LR numbers based on search
	const filteredLRNumbers = availableLRNumbers.filter(lr => 
		!selectedLRNumbers.find(selected => selected.id === lr.id) &&
		(lr.lrNumber.toLowerCase().includes(searchLR.toLowerCase()) ||
		lr.destination.toLowerCase().includes(searchLR.toLowerCase()))
	);

	return (
		<div className='flex min-h-screen bg-gray-50'>
			<Sidebar />
			<div className='flex-1 flex flex-col'>
				<Topbar />
				<div className="flex-1 p-3 sm:p-4 lg:p-6">
					{/* Header Section */}
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-6">
							<button 
								onClick={() => navigate(-1)}
								className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
							>
								<FaArrowLeft className="text-gray-600 w-5 h-5" />
							</button>
							<div>
								<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
									Assign Delivery Boy
								</h1>
								<p className="text-sm text-gray-500 mt-1">
									Assign delivery boy with LR numbers and vehicle details
								</p>
							</div>
						</div>

						{/* Form Container */}
						<div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
							<form onSubmit={handleSubmit}>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									{/* Left Column - Delivery Boy & Vehicle Details */}
									<div className="space-y-6">
										<div className="bg-gradient-to-r from-red-50 to-white p-4 rounded-lg border border-red-100">
											<h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center">
												<FaTruck className="w-5 h-5 mr-2" />
												Delivery Boy Details
											</h3>
											<p className="text-sm text-red-600">Select delivery boy and vehicle information</p>
										</div>

										{/* Delivery Boy Autocomplete */}
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Select Delivery Boy <span className="text-red-500">*</span>
											</label>
											<Autocomplete
												options={deliveryBoys}
												getOptionLabel={(option) => `${option.name} - ${option.phone}`}
												value={selectedDeliveryBoy}
												onChange={handleDeliveryBoyChange}
												renderInput={(params) => (
													<TextField
														{...params}
														placeholder="Search by name or phone..."
														variant="outlined"
														size="small"
													/>
												)}
												renderOption={(props, option) => (
													<li {...props} key={option.id}>
														<div className="flex flex-col">
															<span className="font-medium text-gray-900">{option.name}</span>
															<span className="text-sm text-gray-600">{option.phone}</span>
															<span className="text-xs text-gray-500">Vehicle: {option.vehicleNumber}</span>
														</div>
													</li>
												)}
											/>
										</div>

										{/* Vehicle Number */}
										<div>
											<Input
												type="text"
												label="Vehicle Number *"
												value={vehicleNumber}
												onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
												placeholder="MH01AB1234"
												required
												className="w-full"
											/>
										</div>

										{/* Selected Delivery Boy Info Card */}
										{selectedDeliveryBoy && (
											<div className="bg-green-50 border border-green-200 rounded-lg p-4">
												<h4 className="text-sm font-semibold text-green-800 mb-3">Selected Delivery Boy</h4>
												<div className="space-y-2">
													<div className="flex justify-between">
														<span className="text-sm text-gray-600">Name:</span>
														<span className="text-sm font-medium text-gray-900">{selectedDeliveryBoy.name}</span>
													</div>
													<div className="flex justify-between">
														<span className="text-sm text-gray-600">Phone:</span>
														<span className="text-sm font-medium text-gray-900">{selectedDeliveryBoy.phone}</span>
													</div>
													<div className="flex justify-between">
														<span className="text-sm text-gray-600">Vehicle:</span>
														<span className="text-sm font-medium text-gray-900">{vehicleNumber}</span>
													</div>
												</div>
											</div>
										)}
									</div>

									{/* Right Column - LR Numbers */}
									<div className="space-y-6">
										<div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-100">
											<h3 className="text-lg font-semibold text-blue-800 mb-2">
												LR Numbers
											</h3>
											<p className="text-sm text-blue-600">Add LR numbers for delivery</p>
										</div>

										{/* Search LR Numbers */}
										<div>
											<Input
												type="text"
												label="Search LR Numbers"
												value={searchLR}
												onChange={(e) => setSearchLR(e.target.value)}
												placeholder="Search by LR number or destination..."
												className="w-full"
											/>
										</div>

										{/* Available LR Numbers */}
										<div>
											<h4 className="text-sm font-semibold text-gray-700 mb-3">
												Available LR Numbers ({filteredLRNumbers.length})
											</h4>
											<div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
												{filteredLRNumbers.length > 0 ? (
													<div className="divide-y divide-gray-200">
														{filteredLRNumbers.map((lr) => (
															<div 
																key={lr.id} 
																className="p-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
																onClick={() => handleAddLR(lr)}
															>
																<div>
																	<p className="text-sm font-medium text-gray-900">{lr.lrNumber}</p>
																	<p className="text-xs text-gray-600">{lr.destination} • {lr.weight}</p>
																</div>
																<button
																	type="button"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleAddLR(lr);
																	}}
																	className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
																>
																	<FaPlus className="w-3 h-3" />
																</button>
															</div>
														))}
													</div>
												) : (
													<div className="p-6 text-center text-gray-500 text-sm">
														{searchLR ? 'No LR numbers found' : 'All LR numbers have been added'}
													</div>
												)}
											</div>
										</div>

										{/* Selected LR Numbers */}
										<div>
											<h4 className="text-sm font-semibold text-gray-700 mb-3">
												Selected LR Numbers ({selectedLRNumbers.length})
											</h4>
											<div className="border border-green-200 rounded-lg max-h-64 overflow-y-auto bg-green-50">
												{selectedLRNumbers.length > 0 ? (
													<div className="divide-y divide-green-200">
														{selectedLRNumbers.map((lr, index) => (
															<div 
																key={lr.id} 
																className="p-3 hover:bg-green-100 flex items-center justify-between"
															>
																<div className="flex items-center gap-3">
																	<span className="flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full text-xs font-bold">
																		{index + 1}
																	</span>
																	<div>
																		<p className="text-sm font-medium text-gray-900">{lr.lrNumber}</p>
																		<p className="text-xs text-gray-600">{lr.destination} • {lr.weight}</p>
																	</div>
																</div>
																<button
																	type="button"
																	onClick={() => handleRemoveLR(lr.id)}
																	className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
																	title="Remove"
																>
																	<FaTrash className="w-3 h-3" />
																</button>
															</div>
														))}
													</div>
												) : (
													<div className="p-6 text-center text-gray-500 text-sm">
														No LR numbers selected yet
													</div>
												)}
											</div>
										</div>
									</div>
								</div>

								{/* Summary Card */}
								{selectedDeliveryBoy && selectedLRNumbers.length > 0 && (
									<div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
										<h4 className="text-sm font-semibold text-purple-800 mb-3">Assignment Summary</h4>
										<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
											<div>
												<p className="text-xs text-gray-600 mb-1">Delivery Boy</p>
												<p className="text-sm font-medium text-gray-900">{selectedDeliveryBoy.name}</p>
											</div>
											<div>
												<p className="text-xs text-gray-600 mb-1">Vehicle Number</p>
												<p className="text-sm font-medium text-gray-900">{vehicleNumber}</p>
											</div>
											<div>
												<p className="text-xs text-gray-600 mb-1">Total LR Numbers</p>
												<p className="text-sm font-medium text-gray-900">{selectedLRNumbers.length} items</p>
											</div>
										</div>
									</div>
								)}

								{/* Submit Button */}
								<div className="mt-6 flex items-center justify-end gap-3">
									<button
										type="button"
										onClick={() => navigate(-1)}
										className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={isSubmitting}
										className={`px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ${
											isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
										}`}
									>
										{isSubmitting ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												Assigning...
											</>
										) : (
											<>
												<FaTruck className="w-4 h-4" />
												Assign Delivery Boy
											</>
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AssignDeliveryBoy;


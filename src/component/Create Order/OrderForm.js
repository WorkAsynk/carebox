import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Checkbox, Input, Option, Select } from '@material-tailwind/react';
import axios from 'axios';
import React, { useState } from 'react';
import { FaArrowLeft, FaBackward } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const OrderForm = () => {
	const [senderPhone, setSenderPhone] = useState('');
	const [sender, setSender] = useState({ name: '', phone: '', email: '', gstNo: '', address: '' });

	const fetchUser = async (phone) => {
		if (phone.length === 10) {
			try {
				const { data } = await axios.post(
					'https://grc-logistics-backend.onrender.com/api/order/initiate',
					{ phone }
				);

				if (data.userFound) {
					const userData = {
						name: data.user?.name || '',
						phone: data.user?.phone || phone,
						email: data.user?.email || '',
						gstNo: data.user?.gstNo || '',
						address: data.addresses[0] || '',
					};

					setSender(userData);

					// If no address, send one (example endpoint, should be replaced)
					if (data.addresses.length === 0 && userData.address) {
						await axios.post('https://grc-logistics-backend.onrender.com/api/user/add-address', {
							phone,
							address: userData.address,
						});
					}
				} else {
					setSender({ name: '', phone, email: '', gstNo: '', address: '' });
				}
			} catch (error) {
				console.error('Error fetching user:', error);
			}
		}
	};
	return (
		<div className="min-h-screen bg-[#F9FAFB] p-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div className='flex justify-start items-center gap-5'>
						<Link to={"/"}>
							<button className='border-[1px] border-[#cecece] px-2 py-2 hover:shadow-blue-gray-200 shadow-sm'>
								<FaArrowLeft />
							</button>
						</Link>
						<h2 className='font-semibold text-xl'>Create Order</h2>
					</div>
					<button className="text-xs text-blue-500 border border-blue-200 rounded px-2 py-1">Learn More</button>
				</div>

				{/* Form Grid */}
				<div className="min-h-screen bg-gray-50 p-6">
					<div className="max-w-5xl mx-auto space-y-6">

						{/* Top Section */}
						<div className="bg-white p-4 rounded-md shadow-sm ">
							<h2 className="font-semibold text-gray-700 mb-2">Order Detail
							</h2>
							<div className='grid grid-cols-2 gap-4'>
								<Input label='AWB Number' placeholder="Enter AWB Number" />
								<Input label='MF Number' placeholder="Enter MF Number" />
								<Select label='Mode'>
									<Option value='Air'>Air</Option>
									<Option value='Surface'>Surface</Option>
								</Select>
								<Input label='AWB Number' placeholder="Enter AWB Number" />
							</div>
						</div>

						{/* Sender / Receiver & Product Info Section */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{/* Left Side - Sender & Receiver */}
							<div className="space-y-6 col-span-2">
								<div className="bg-white p-4 rounded-md shadow-sm">
									<h2 className="font-semibold text-gray-700 mb-2">Sender Detail</h2>

									{/* Search by phone input with Enter support */}
									<Input
										label="Search"
										placeholder="Enter Your Mobile Number"
										value={sender.phone}
										onChange={(e) => setSender({ ...sender, phone: e.target.value })}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												fetchUser(sender.phone);
											}
										}}
									/>

									<hr className="mt-2 mb-2" />

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

									<Input
										label="Address"
										placeholder="Enter Address"
										value={sender.address}
										onChange={(e) => setSender({ ...sender, address: e.target.value })}
									/>

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
								</div>

								<div className="bg-white p-4 rounded-md shadow-sm">
									<h2 className="font-semibold text-gray-700 mb-2">Receiver Detail
									</h2>
									<Input label='Search' placeholder='Enter Your Mobile Number' />
									<hr className='mt-2 mb-2' />
									<div className='grid grid-cols-2 gap-2 mb-2'>
										<Input label='Name' placeholder='Enter Name' />
										<Input label='Mobile' placeholder='Enter Your Mobile Number' />
									</div>
									<Input label='Address' placeholder='Enter Address' />
									<div className='grid grid-cols-2 gap-2 mt-2'>
										<Input label='Email' placeholder='Enter Email' />
									</div>
								</div>
							</div>
							{/* Right Side - Product Info */}
							<div className="bg-white p-4 rounded-md shadow-sm space-y-4">
								<h2 className="font-semibold text-gray-700 mb-2">Product Detail
								</h2>
								<Input label='Reference ID' placeholder='Enter Your Reference ID' />
								<div className="w-full">
									<label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
									<div className="flex items-center gap-3">
										<Input
											label="Length"
											type="number"
											className="w-18"
											containerProps={{ className: "min-w-0" }}
										/>
										<Input
											label="Breadth"
											type="number"
											className="w-18"
											containerProps={{ className: "min-w-0" }}
										/>
										<Input
											label="Height"
											type="number"
											className="w-18"
											containerProps={{ className: "min-w-0" }}
										/>
										<div className="px-4 py-[0.65rem] bg-gray-100 rounded text-sm text-gray-600 font-medium">
											cm
										</div>
									</div>
									<p className="text-xs text-gray-500 mt-2">
										Length + Breadth + Height should be at least 15 cm
									</p>
								</div>
								<div className="space-y-4">
									{/* Package Weight Input */}
									<div className="w-full">
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Package weight
										</label>
										<div className="flex items-center">
											<Input
												type="number"
												placeholder="Enter package weight"
												className="w-full"
												containerProps={{ className: "min-w-0" }}
											/>
											<div className="ml-2 px-4 py-[0.65rem] bg-gray-100 rounded text-sm text-gray-600 font-medium">
												gm
											</div>
										</div>
										<p className="text-xs text-gray-500 mt-1">
											Packaged weight should be at least 50 grams
										</p>
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
											<span className="font-medium text-sm text-gray-800">Total Chargeable Weight</span>
											<InformationCircleIcon className="w-4 h-4 text-gray-400 ml-2" />
										</div>
										<p className="text-gray-500 text-sm mt-1">-- gm</p>
									</div>
								</div>
							</div>
						</div>

						{/* Bottom Section - Invoice No */}
						<div className="bg-white p-4 rounded-md shadow-sm">
							<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
								<Input label="Invoice Value *" />

								<Select label="Invoice/EwayBill" defaultValue="INVOICE">
									<Option value="INVOICE">INVOICE</Option>
									<Option value="EWAYBILL">EWAYBILL</Option>
								</Select>

								<Input label="Eway Bill No" />
								<Input label="Invoice No" />

								<Input label="Nos of Eway" defaultValue="1" disabled />

								<div className="col-span-1 flex flex-col">
									<Select label="Risk Covered By">
										<Option value="NONE">NONE</Option>
										<Option value="SELLER">SELLER</Option>
										<Option value="BUYER">BUYER</Option>
									</Select>
								</div>

								<Input label="Policy No" />
								<Select label="VAS" defaultValue="NORMAL">
									<Option>NORMAL</Option>
									<Option>PREMIUM</Option>
								</Select>

								<Input label="Topay" defaultValue="0" />
								<Input label="COD" defaultValue="0" />

								<Select label="PayMode" defaultValue="Cheque">
									<Option>Cheque</Option>
									<Option>Cash</Option>
									<Option>Online</Option>
								</Select>

								<Input label="Favor" />
								<Select label="Paperwork" defaultValue="INVOICE">
									<Option>INVOICE</Option>
									<Option>POD</Option>
								</Select>

								<Select label="--Select Content--">
									<Option>Clothing</Option>
									<Option>Documents</Option>
									<Option>Electronics</Option>
								</Select>

								<div className='cols-span-1'>
									<Input label="Remarks" />
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* Footer Buttons */}
				<div className="flex justify-between items-center mt-10">
					<button className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
					<div className="flex gap-3">
						<button className="px-5 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">Create Order and Manifest Later</button>
						<button className="px-5 py-2 rounded-md bg-black text-white hover:bg-gray-900">Create Order and Get AWB</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderForm;

import React, { useState, useEffect, useRef } from 'react';
import { ArrowDownTrayIcon, PlusIcon, TrashIcon, DocumentChartBarIcon, CloudArrowUpIcon } from '@heroicons/react/24/solid';
import { Input, Option, Select } from '@material-tailwind/react';

const RateChartManager = ({ onDataChange, initialData = null }) => {
	const [rateChartMethod, setRateChartMethod] = useState('table'); // 'csv' or 'table'
	const [csvFile, setCsvFile] = useState(null);
	const [uploadedFiles, setUploadedFiles] = useState({});
	const [expandedPartners, setExpandedPartners] = useState({});
	const [successMessages, setSuccessMessages] = useState({});
	const isUpdatingFromParent = useRef(false);
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
		}
	]);

	// Initialize with provided data if available
	useEffect(() => {
		if (initialData) {
			isUpdatingFromParent.current = true;
			setRateChartData(initialData);
			isUpdatingFromParent.current = false;
		}
	}, [initialData]);

	// Notify parent component when data changes - only when user makes changes
	const notifyParent = (newData) => {
		if (onDataChange) {
			onDataChange(newData);
		}
	};

	const handleCsvUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			setCsvFile(file);
			parseCSVFile(file);
		}
	};

	const parseCSVFile = (file) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const csv = e.target.result;
			const lines = csv.split('\n');
			const headers = lines[0].split(',').map(h => h.trim());
			
			// Group data by partner name (assuming first column is partner name)
			const partnerData = {};
			
			for (let i = 1; i < lines.length; i++) {
				if (lines[i].trim()) {
					const values = lines[i].split(',').map(v => v.trim());
					const partnerName = values[0];
					
					if (!partnerData[partnerName]) {
						partnerData[partnerName] = { chart: [] };
					}
					
					partnerData[partnerName].chart.push({
						"Zone": values[1] || "Z1",
						"minValue": parseInt(values[2]) || 0,
						"minWeight": parseInt(values[3]) || 0,
						"ODA": parseInt(values[4]) || 0,
						"COD": parseInt(values[5]) || 0,
						"otherCharges": parseInt(values[6]) || 0
					});
				}
			}
			
			setRateChartData(partnerData);
		};
		reader.readAsText(file);
	};

	const downloadSampleCSV = (partnerName = null) => {
		let csvContent;
		let fileName;
		
		if (partnerName) {
			// Different sample data for each partner
			const sampleData = {
				'Bluedart': [
					['Zone', 'minValue', 'minWeight', 'ODA', 'COD', 'otherCharges'],
					['Z1', '200', '500', '10', '20', '20'],
					['Z1', '400', '200', '5', '5', '5'],
					['Z3', '100', '100', '1', '1', '1'],
					['Z4', '500', '200', '7', '7', '7'],
					['Z5', '300', '400', '5', '5', '5']
				],
				'Shree Maruthi': [
					['Zone', 'minValue', 'minWeight', 'ODA', 'COD', 'otherCharges'],
					['Z1', '150', '400', '8', '15', '15'],
					['Z2', '300', '300', '6', '12', '12'],
					['Z3', '80', '80', '2', '3', '3'],
					['Z4', '400', '150', '5', '8', '8'],
					['Z5', '250', '350', '4', '6', '6']
				],
				'Tirupati': [
					['Zone', 'minValue', 'minWeight', 'ODA', 'COD', 'otherCharges'],
					['Z1', '180', '450', '9', '18', '18'],
					['Z2', '350', '250', '7', '14', '14'],
					['Z3', '90', '90', '3', '4', '4'],
					['Z4', '450', '180', '6', '9', '9'],
					['Z5', '280', '380', '5', '7', '7']
				],
				'DTDC': [
					['Zone', 'minValue', 'minWeight', 'ODA', 'COD', 'otherCharges'],
					['Z1', '220', '550', '12', '22', '22'],
					['Z2', '420', '220', '8', '16', '16'],
					['Z3', '110', '110', '2', '2', '2'],
					['Z4', '520', '220', '8', '8', '8'],
					['Z5', '320', '420', '6', '6', '6']
				]
			};
			
			csvContent = sampleData[partnerName].map(row => row.join(',')).join('\n');
			fileName = `sample_${partnerName.replace(/\s+/g, '_').toLowerCase()}_ratechart.csv`;
		} else {
			// Default sample for all partners
			csvContent = "Zone,minValue,minWeight,ODA,COD,otherCharges\n" +
				"Z1,200,500,10,20,20\n" +
				"Z1,400,200,5,5,5\n" +
				"Z3,100,100,1,1,1\n" +
				"Z4,500,200,7,7,7\n" +
				"Z5,300,400,5,5,5";
			fileName = 'sample_ratechart.csv';
		}
		
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		a.click();
		window.URL.revokeObjectURL(url);
	};


	// Toggle accordion for partner
	const togglePartnerAccordion = (partnerName) => {
		setExpandedPartners(prev => ({
			...prev,
			[partnerName]: !prev[partnerName]
		}));
	};

	// Show success message for partner
	const showSuccessMessage = (partnerName, message) => {
		setSuccessMessages(prev => ({
			...prev,
			[partnerName]: message
		}));
		
		// Auto-hide success message after 3 seconds
		setTimeout(() => {
			setSuccessMessages(prev => {
				const newMessages = { ...prev };
				delete newMessages[partnerName];
				return newMessages;
			});
		}, 3000);
	};


	const handlePartnerCsvUpload = (partnerName, file) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const csv = e.target.result;
			const lines = csv.split('\n');
			
			const newChart = [];
			for (let i = 1; i < lines.length; i++) {
				if (lines[i].trim()) {
					const values = lines[i].split(',').map(v => v.trim());
					newChart.push({
						"Zone": values[0] || "Z1",
						"minValue": parseInt(values[1]) || 0,
						"minWeight": parseInt(values[2]) || 0,
						"ODA": parseInt(values[3]) || 0,
						"COD": parseInt(values[4]) || 0,
						"otherCharges": parseInt(values[5]) || 0
					});
				}
			}
			
			const updatedData = rateChartData.map(partner => 
				partner.name === partnerName 
					? { ...partner, chart: newChart }
					: partner
			);
			setRateChartData(updatedData);
			notifyParent(updatedData);
			
			// Store uploaded file info
			setUploadedFiles(prev => ({
				...prev,
				[partnerName]: {
					name: file.name,
					size: file.size,
					uploadedAt: new Date().toLocaleString()
				}
			}));
			
			// Show success message
			showSuccessMessage(partnerName, `✅ CSV uploaded successfully! ${newChart.length} zones imported.`);
		};
		reader.readAsText(file);
	};





	const updateZoneData = (partnerName, zoneIndex, field, value) => {
		const updatedData = rateChartData.map(partner => 
			partner.name === partnerName 
				? {
					...partner,
					chart: partner.chart.map((zone, index) => 
						index === zoneIndex 
							? { ...zone, [field]: value }
							: zone
					)
				}
				: partner
		);
		setRateChartData(updatedData);
		notifyParent(updatedData);
	};

	return (
		<div className="space-y-6">
			{/* Method Selection */}
			<div className="bg-gradient-to-r from-red-50 to-white p-4 rounded-lg border border-red-100">
				<h4 className="text-lg font-semibold text-red-800 mb-2 flex items-center">
					<DocumentChartBarIcon className="w-5 h-5 mr-2" />
					Step 3: Rate Chart Update
				</h4>
				<p className="text-sm text-red-600">Choose your preferred method to create rate charts</p>
			</div>
			
			<div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
				<h4 className="text-xl font-semibold text-gray-800 mb-6">Choose Rate Chart Method</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* CSV Upload Option */}
					<div 
						className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
							rateChartMethod === 'csv' 
							? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 shadow-lg' 
							: 'border-gray-200 hover:border-red-300 hover:shadow-md'
						}`}
						onClick={() => setRateChartMethod('csv')}
					>
						<div className="flex items-center space-x-4">
							<div className={`p-3 rounded-lg ${rateChartMethod === 'csv' ? 'bg-red-500' : 'bg-gray-100'}`}>
								<ArrowDownTrayIcon className={`w-6 h-6 ${rateChartMethod === 'csv' ? 'text-white' : 'text-gray-600'}`} />
							</div>
							<div>
								<h5 className="font-semibold text-gray-800 text-lg">Upload CSV</h5>
								<p className="text-sm text-gray-600">Upload rate chart from CSV file</p>
							</div>
						</div>
					</div>

					{/* Table Creation Option */}
					<div 
						className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
							rateChartMethod === 'table' 
							? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100 shadow-lg' 
							: 'border-gray-200 hover:border-red-300 hover:shadow-md'
						}`}
						onClick={() => setRateChartMethod('table')}
					>
						<div className="flex items-center space-x-4">
							<div className={`p-3 rounded-lg ${rateChartMethod === 'table' ? 'bg-red-500' : 'bg-gray-100'}`}>
								<DocumentChartBarIcon className={`w-6 h-6 ${rateChartMethod === 'table' ? 'text-white' : 'text-gray-600'}`} />
							</div>
							<div>
								<h5 className="font-semibold text-gray-800 text-lg">Create Table</h5>
								<p className="text-sm text-gray-600">Manually create rate chart table</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CSV Upload Section */}
			{rateChartMethod === 'csv' && (
				<div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
					<h4 className="text-xl font-semibold text-gray-800 mb-6">CSV Upload</h4>
					
					{/* Sample CSV Download */}
					{/* <div className="mb-6 flex justify-center">
						<button
							type="button"
							onClick={downloadSampleCSV}
							className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-md hover:shadow-lg"
						>
							<ArrowDownTrayIcon className="w-5 h-5 mr-2" />
							Download Sample CSV
						</button>
					</div> */}

					{/* Individual Partner Uploads - Accordion */}
					<div className="space-y-4">
						<h5 className="text-lg font-semibold text-gray-800 mb-4">Upload CSV for Each Partner</h5>
						{rateChartData.map((partner) => {
							const partnerName = partner.name;
							const partnerData = partner;
							return (
							<div key={partnerName} className="bg-white border border-gray-200 rounded-lg shadow-sm">
								{/* Accordion Header */}
								<div 
									className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
									onClick={() => togglePartnerAccordion(partnerName)}
								>
									<div className="flex items-center">
										<div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
										<span className="text-lg font-medium text-gray-800">{partnerName}</span>
										{uploadedFiles[partnerName] && (
											<span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
												✓ Uploaded
											</span>
										)}
									</div>
									
									<div className="flex items-center gap-2">
										{/* Download Sample CSV Button */}
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												downloadSampleCSV(partnerName);
											}}
											className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm"
										>
											<ArrowDownTrayIcon className="w-4 h-4 mr-1" />
											Sample
										</button>
										
										{/* Expand/Collapse Icon */}
										<div className={`transform transition-transform duration-200 ${expandedPartners[partnerName] ? 'rotate-180' : ''}`}>
											<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
											</svg>
										</div>
									</div>
								</div>
								
								{/* Accordion Content */}
								{expandedPartners[partnerName] && (
									<div className="border-t border-gray-200 p-4">
										{/* Success Message */}
										{successMessages[partnerName] && (
											<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
												<p className="text-green-800 text-sm font-medium">
													{successMessages[partnerName]}
												</p>
											</div>
										)}
										
										{/* Upload Section */}
										<div className="space-y-4">
											<div className="relative">
												<input
													type="file"
													accept=".csv"
													onChange={(e) => {
														if (e.target.files[0]) {
															handlePartnerCsvUpload(partnerName, e.target.files[0]);
														}
													}}
													className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
													id={`csv-upload-${partnerName}`}
												/>
												<label
													htmlFor={`csv-upload-${partnerName}`}
													className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
												>
													<CloudArrowUpIcon className="w-5 h-5 mr-2" />
													Upload CSV for {partnerName}
												</label>
											</div>
											
											{/* Uploaded File Info */}
											{uploadedFiles[partnerName] && (
												<div className="p-3 bg-green-50 border border-green-200 rounded-lg">
													<div className="flex items-center justify-between">
														<div>
															<p className="text-sm font-medium text-green-800">
																📁 {uploadedFiles[partnerName].name}
															</p>
															<p className="text-xs text-green-600">
																Size: {(uploadedFiles[partnerName].size / 1024).toFixed(1)} KB
															</p>
															<p className="text-xs text-green-600">
																Uploaded: {uploadedFiles[partnerName].uploadedAt}
															</p>
														</div>
														<button
															type="button"
															onClick={() => {
																setUploadedFiles(prev => {
																	const newFiles = { ...prev };
																	delete newFiles[partnerName];
																	return newFiles;
																});
															}}
															className="text-red-500 hover:text-red-700 transition-colors duration-200"
														>
															<TrashIcon className="w-4 h-4" />
														</button>
													</div>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Table Creation Section */}
			{rateChartMethod === 'table' && (
				<div className="space-y-6">

					{/* Partners List */}
					{rateChartData.map((partner) => {
						const partnerName = partner.name;
						const partnerData = partner;
						return (
						<div key={partnerName} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
							{/* Partner Header */}
							<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
								<div className="flex flex-col sm:flex-row sm:items-center gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-3">
											<Input
												type="text"
												value={partnerName}
												disabled={true}
												placeholder="Partner Name"
												className="text-lg font-semibold bg-gray-100"
												label="Partner Name"
											/>
											{/* <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
												Default
											</span> */}
										</div>
									</div>
								</div>
								
							</div>

							{/* Uploaded File Info */}
							{uploadedFiles[partnerName] && (
								<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
											<div>
												<p className="text-sm font-medium text-green-800">
													Uploaded: {uploadedFiles[partnerName].name}
												</p>
												<p className="text-xs text-green-600">
													Size: {(uploadedFiles[partnerName].size / 1024).toFixed(1)} KB • 
													Uploaded at: {uploadedFiles[partnerName].uploadedAt}
												</p>
											</div>
										</div>
										<button
											type="button"
											onClick={() => {
												const newUploadedFiles = { ...uploadedFiles };
												delete newUploadedFiles[partnerName];
												setUploadedFiles(newUploadedFiles);
											}}
											className="text-green-600 hover:text-green-800 transition-colors duration-200"
										>
											<TrashIcon className="w-4 h-4" />
										</button>
									</div>
								</div>
							)}

							{/* Default Values Info */}
							{/* <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
								<p className="text-green-800 text-sm font-medium flex items-center">
									<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									Default Rate Chart - Z1 to Z5 zones with default values (editable)
								</p>
							</div> */}
							<div className="overflow-x-auto rounded-xl border-2 border-red-500 shadow-2xl">
								<table className="w-full">
									<thead className="bg-gradient-to-r from-red-500 to-red-600">
										<tr>
											<th className="px-6 py-4 text-left text-sm font-bold text-white border-b border-red-400">Zone</th>
											<th className="px-6 py-4 text-left text-sm font-bold text-white border-b border-red-400">Min Value (₹)</th>
											<th className="px-6 py-4 text-left text-sm font-bold text-white border-b border-red-400">Min Weight (gm)</th>
											<th className="px-6 py-4 text-left text-sm font-bold text-white border-b border-red-400">ODA (%)</th>
											<th className="px-6 py-4 text-left text-sm font-bold text-white border-b border-red-400">COD (%)</th>
											<th className="px-6 py-4 text-left text-sm font-bold text-white border-b border-red-400">Other Charges (%)</th>
										</tr>
									</thead>
									<tbody>
										{partnerData.chart.map((zoneData, zoneIndex) => (
											<tr key={zoneIndex} className="border-b border-red-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-white transition-colors duration-150">
												<td className="px-6 py-4">
													<Input
														value={zoneData.Zone}
														disabled={true}
														className="!border-red-300 bg-red-50"
														label="Zone"
													/>
												</td>
												<td className="px-6 py-4">
													<Input
														type="number"
														value={zoneData['minValue']}
														onChange={(e) => updateZoneData(partnerName, zoneIndex, 'minValue', parseInt(e.target.value) || 0)}
														placeholder="200"
														required
														className="!border-red-300 focus:!border-red-500 hover:!border-red-400 transition-colors duration-200"
														label="Min Value"
													/>
												</td>
												<td className="px-6 py-4">
													<Input
														type="number"
														value={zoneData['minWeight']}
														onChange={(e) => updateZoneData(partnerName, zoneIndex, 'minWeight', parseInt(e.target.value) || 0)}
														placeholder="500"
														required
														className="!border-red-300 focus:!border-red-500 hover:!border-red-400 transition-colors duration-200"
														label="Min Weight"
													/>
												</td>
												<td className="px-6 py-4">
													<Input
														type="number"
														value={zoneData.ODA}
														onChange={(e) => updateZoneData(partnerName, zoneIndex, 'ODA', parseInt(e.target.value) || 0)}
														placeholder="10"
														required
														className="!border-red-300 focus:!border-red-500 hover:!border-red-400 transition-colors duration-200"
														label="ODA %"
													/>
												</td>
												<td className="px-6 py-4">
													<Input
														type="number"
														value={zoneData.COD}
														onChange={(e) => updateZoneData(partnerName, zoneIndex, 'COD', parseInt(e.target.value) || 0)}
														placeholder="20"
														required
														className="!border-red-300 focus:!border-red-500 hover:!border-red-400 transition-colors duration-200"
														label="COD %"
													/>
												</td>
												<td className="px-6 py-4">
													<Input
														type="number"
														value={zoneData['otherCharges']}
														onChange={(e) => updateZoneData(partnerName, zoneIndex, 'otherCharges', parseInt(e.target.value) || 0)}
														placeholder="20"
														required
														className="!border-red-300 focus:!border-red-500 hover:!border-red-400 transition-colors duration-200"
														label="Other Charges %"
													/>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default RateChartManager;

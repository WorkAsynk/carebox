import React, { useEffect, useState } from 'react'
import Topbar from '../component/Layout/Topbar'
import Sidebar from '../component/Layout/Sidebar'
import axios from 'axios'
import Address from '../component/AddressList/Address'
import { buildApiUrl, API_ENDPOINTS } from '../config/api'

const AddressList = () => {
	const [address, setaddress] = useState([])
	
	useEffect(() => {
		const fetchAddress = async () => {
			try {
				const res = await axios.get(buildApiUrl(API_ENDPOINTS.FETCH_ALL_ADDRESSES));
				// Filter addresses where is_deleted is false
				const activeAddresses = (res.data.addresses || []).filter(address => address?.is_deleted === false);
				setaddress(activeAddresses);
			} catch (error) {
				console.error('Error fetching addresses:', error);
			}
		};
		fetchAddress();
	}, [])

	// Handle address deletion
	const handleAddressDelete = (deletedAddressId) => {
		setaddress(prevAddresses => 
			prevAddresses.filter(addr => addr.id !== deletedAddressId)
		);
	};

	console.log(address)

	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<div className="p-6">
					<Address address={address} onAddressDelete={handleAddressDelete} />
				</div>
			</div>
		</div>
	)
}

export default AddressList;
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
				setaddress(res.data.addresses || []);
			} catch (error) {
				console.error('Error fetching users:', error);
			}
		};
		fetchAddress();
	}, [])

	console.log(address)

	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<div className="p-6">
					<Address address={address} />
				</div>
			</div>
		</div>
	)
}

export default AddressList;
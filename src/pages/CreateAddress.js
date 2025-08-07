import React from 'react'
import Topbar from '../component/Layout/Topbar'
import Sidebar from '../component/Layout/Sidebar'
import AddressForm from '../component/Create Address/AddressForm'

const CreateAddress = () => {
	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<AddressForm />
			</div>
		</div>
	)
}

export default CreateAddress
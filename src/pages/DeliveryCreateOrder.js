import React from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import DeliveryOrderForm from '../component/Create Order/DeliveryOrderForm'

const DeliveryCreateOrder = () => {
	
	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<DeliveryOrderForm />
			</div>
		</div>
	)
}

export default DeliveryCreateOrder



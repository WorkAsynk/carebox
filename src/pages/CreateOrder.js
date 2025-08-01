import React from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import OrderForm from '../component/Create Order/OrderForm'

const CreateOrder = () => {



	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<OrderForm />
			</div>
		</div>
	)
}

export default CreateOrder
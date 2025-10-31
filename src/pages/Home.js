import React, { useEffect, useState } from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import HomeDashbaord from '../component/Home/HomeDashbaord'
import { useLocation } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { useSelector } from 'react-redux'
import DeliveryDashboard from '../component/Home/DeliveryDashboard'

const Home = () => {

	const { user } = useSelector((state) => state.auth);

	const Delivery = user?.role === 'Delivery Boy';

	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				{
					Delivery ? <DeliveryDashboard /> : <HomeDashbaord />
				}
			</div>
			
		</div>
	)
}

export default Home
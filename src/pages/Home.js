import React, { useEffect, useState } from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import HomeDashbaord from '../component/Home/HomeDashbaord'
import { useLocation } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

const Home = () => {
	

	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<HomeDashbaord />
			</div>
			
		</div>
	)
}

export default Home
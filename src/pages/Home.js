import React from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import HomeDashbaord from '../component/Home/HomeDashbaord'

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
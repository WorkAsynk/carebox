import React from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'

const CreatUser = () => {
	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
			</div>
		</div>
	)
}

export default CreatUser
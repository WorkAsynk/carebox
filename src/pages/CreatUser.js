import React from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import CreateUserForm from '../component/Create User/CreateUserForm'

const CreatUser = () => {
	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<CreateUserForm />
			</div>
		</div>
	)
}

export default CreatUser
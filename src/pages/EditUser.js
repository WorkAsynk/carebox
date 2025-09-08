import React from 'react'
import Sidebar from '../component/Layout/Sidebar'
import Topbar from '../component/Layout/Topbar'
import EditUserForm from '../component/Edit User/EditUserForm'

const EditUser = () => {
	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<EditUserForm />
			</div>
		</div>
	)
}

export default EditUser

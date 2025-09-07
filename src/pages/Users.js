import React, { useEffect, useState } from 'react';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import axios from 'axios';
import UsersList from '../component/User/UsersList';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';



const Users = () => {
	const [users, setUsers] = useState([]);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const res = await axios.get(buildApiUrl(API_ENDPOINTS.FETCH_ALL_USERS));
				setUsers(res.data.user || []);
			} catch (error) {
				console.error('Error fetching users:', error);
			}
		};
		fetchUsers();
	}, []);

	console.log(users)
	return (	
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<div className="p-6">
					<UsersList users={users} />
				</div>
			</div>
		</div>
	);
};

export default Users;

import React, { useEffect, useState } from 'react';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import axios from 'axios';
import UsersList from '../component/User/UsersList';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { CheckCircleIcon } from '@heroicons/react/24/solid';



const Users = () => {
	const [users, setUsers] = useState([]);
	const [showOverlay, setShowOverlay] = useState(false);
	const [overlayStatus, setOverlayStatus] = useState('loading'); // 'loading' | 'success'

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const res = await axios.get(buildApiUrl(API_ENDPOINTS.FETCH_ALL_USERS));
				// Filter users where is_delete is false
				const activeUsers = (res.data.user || []).filter(user => user?.is_deleted === false);
				setUsers(activeUsers);
			} catch (error) {
				console.error('Error fetching users:', error);
			}
		};
		fetchUsers();
	}, []);
	const handleDeleteUser = async (user_id ) => {
		try {
			setShowOverlay(true);
			setOverlayStatus('loading');
			await axios.post(buildApiUrl(API_ENDPOINTS.DELETE_USER), { 
				 user_id  
			});
			setUsers(users.filter(user => user.id !== user_id ));
			setOverlayStatus('success');
			setTimeout(() => {
				setShowOverlay(false);
			}, 800);
		} catch (error) {
			console.error('Error deleting user:', error);
			setShowOverlay(false);
		}
	};

	

	console.log(users)
	return (	
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				<div className="p-6">
					<UsersList users={users} handleDeleteUser={handleDeleteUser} />
				</div>
			</div>

			{showOverlay && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
						{overlayStatus === 'loading' && (
							<div className="flex flex-col items-center">
								<div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin mb-3"></div>
								<p className="text-gray-700 text-sm">Deleting user...</p>
							</div>
						)}
						{overlayStatus === 'success' && (
							<div className="flex flex-col items-center">
								<CheckCircleIcon className="w-14 h-14 text-green-500" />
								<p className="text-gray-700 text-sm mt-2">User deleted successfully</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default Users;

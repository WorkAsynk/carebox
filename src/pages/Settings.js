import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Input, Button } from '@material-tailwind/react';
import axios from 'axios';
import Sidebar from '../component/Layout/Sidebar';
import Topbar from '../component/Layout/Topbar';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { logout } from '../redux/actions/authActions';

const Settings = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { user } = useSelector(state => state.auth);
	
	// Password change state
	const [passwordData, setPasswordData] = useState({
		newPassword: ''
	});
	const [showPasswords, setShowPasswords] = useState({
		new: false
	});
	const [passwordLoading, setPasswordLoading] = useState(false);
	const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

	// Handle password change
	const handlePasswordChange = async (e) => {
		e.preventDefault();
		
		if (passwordData.newPassword.length < 6) {
			setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters' });
			return;
		}

		setPasswordLoading(true);
		setPasswordMessage({ type: '', text: '' });

		try {
			const payload = {
				user_id: user?.id,
				new_password: passwordData.newPassword,
			};

			const response = await axios.post(
				buildApiUrl(API_ENDPOINTS.UPDATE_PASSWORD),
				payload,
				{ headers: { 'Content-Type': 'application/json' } }
			);

			// 200: { success: true, message: "Password updated successfully"}
			if (response.status === 200 && response.data?.success) {
				setPasswordMessage({ type: 'success', text: response.data?.message || 'Password updated successfully' });
				setPasswordData({ newPassword: '' });
				// Logout and redirect after success
				dispatch(logout());
				navigate('/login');
				return;
			} else {
				setPasswordMessage({ type: 'error', text: response.data?.message || 'Failed to update password' });
			}
		} catch (error) {
			const status = error.response?.status;
			const apiMsg = error.response?.data?.message;

			if (status === 400) {
				setPasswordMessage({ type: 'error', text: apiMsg || 'Missing parameters' });
			} else if (status === 404) {
				setPasswordMessage({ type: 'error', text: apiMsg || 'User not found' });
			} else if (status === 500) {
				setPasswordMessage({ type: 'error', text: apiMsg || 'Database error' });
			} else {
				setPasswordMessage({ type: 'error', text: apiMsg || 'Failed to change password. Please try again.' });
			}
		} finally {
			setPasswordLoading(false);
		}
	};


	return (
		<div className='flex'>
			<Sidebar />
			<div className='flex-1'>
				<Topbar />
				
				{/* Settings Content */}
				<div className='max-w-4xl mx-auto mt-5 p-6'>
					{/* Header */}
					<div className='mb-6'>
						<div className='flex items-center gap-4'>
							<Link to="/">
								<button className='group flex items-center justify-center w-10 h-10 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm'>
									<FaArrowLeft className='text-gray-600 group-hover:text-gray-800 transition-colors' />
								</button>
							</Link>
							<div>
								<h2 className='text-2xl font-bold text-gray-900'>Change Password</h2>
								<p className='text-sm text-gray-500 mt-1'>Update your account password for better security</p>
							</div>
						</div>
					</div>

					{/* Password Change Form */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
						<div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4">
							<h3 className="text-lg font-semibold">Password Security</h3>
							<p className="text-red-100 text-sm mt-1">Keep your account secure with a strong password</p>
						</div>
						
						<div className="p-6">
							<form onSubmit={handlePasswordChange} className="space-y-6">
								<div className="space-y-4">
									{/* Disabled User ID Field */}
									<div className="relative">
										<Input
											label="User ID"
											type="text"
											value={user?.id ?? ''}
											disabled
											readOnly
											size="lg"
										/>
									</div>

									<div className="relative">
										<Input
											label="New Password"
											type={showPasswords.new ? "text" : "password"}
											value={passwordData.newPassword}
											onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
											required
											size="lg"
										/>
										<button
											type="button"
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
											onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
										>
											{showPasswords.new ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
										</button>
									</div>
								</div>

								{passwordMessage.text && (
									<div className={`p-4 rounded-lg ${
										passwordMessage.type === 'success' 
											? 'bg-green-100 text-green-800 border border-green-200' 
											: 'bg-red-100 text-red-800 border border-red-200'
									}` }>
										<div className="flex items-center gap-2">
											{passwordMessage.type === 'success' ? (
												<svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
												</svg>
											) : (
												<svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
												</svg>
											)}
											<span className="font-medium">{passwordMessage.text}</span>
										</div>
									</div>
								)}

								<div className="flex gap-3">
									<Button
										type="submit"
										loading={passwordLoading}
										className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex-1"
									>
										{passwordLoading ? 'Updating Password...' : 'Update Password'}
									</Button>
									<Button
										type="button"
										variant="outlined"
										onClick={() => {
											setPasswordData({ newPassword: '' });
											setPasswordMessage({ type: '', text: '' });
										}}
										className="px-8 py-3 rounded-lg font-medium transition-colors duration-200"
									>
										Clear
									</Button>
								</div>
							</form>

							{/* Password Requirements */}
							<div className="mt-6 p-4 bg-gray-50 rounded-lg">
								<h4 className="font-semibold text-gray-900 mb-3">Password Requirements:</h4>
								<ul className="space-y-2 text-sm text-gray-600">
									<li className="flex items-center gap-2">
										<div className={`w-2 h-2 rounded-full ${passwordData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
										At least 6 characters long
									</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Security Notice */}
					{/* <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<div className="flex items-start gap-3">
							<svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
							</svg>
							<div>
								<h4 className="font-semibold text-blue-900 mb-1">Security Tips</h4>
								<p className="text-blue-800 text-sm">
									For better security, use a combination of uppercase and lowercase letters, numbers, and special characters. 
									Avoid using personal information or common words in your password.
								</p>
							</div>
						</div>
					</div> */}
				</div>
			</div>
		</div>
	);
};

export default Settings;

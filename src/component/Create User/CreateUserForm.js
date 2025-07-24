import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerAdmin } from '../../redux/actions/authActions';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CreateUserForm = () => {
	const dispatch = useDispatch();
	const { loading, error, registerSuccess } = useSelector((state) => state.auth);
	const [showPassword, setShowPassword] = useState(false);

	// Toggle password visibility
	const togglePasswordVisibility = () => setShowPassword(!showPassword);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		gstNo: "",
		role: "Admin", // Default role as Admin
		password: "",
	});

	const navigate = useNavigate()

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		dispatch(registerAdmin(formData));
		alert('User Register Successfully')
		navigate('/')

	};

	return (
		<div className="min-h-screen min-w-max flex items-center justify-center pt-[0.5%] pl-[10%] pr-[5%]">
			<div className="w-full bg-white rounded-xl  space-y-6">
				<h2 className="text-3xl font-semibold text-black text-center">Create New Admin</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					{[
						{ label: 'Full Name', name: 'name', type: 'text' },
						{ label: 'Email Address', name: 'email', type: 'email' },
						{ label: 'Phone Number', name: 'phone', type: 'text' },
						{ label: 'GST Number', name: 'gstNo', type: 'text' },
					].map(({ label, name, type }) => (
						<div key={name}>
							<label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
								{label}
							</label>
							<input
								id={name}
								type={type}
								name={name}
								value={formData[name]}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
								placeholder={label}
							/>
						</div>
					))}

					<div>
						<label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
							Select Role
						</label>
						<select
							id="role"
							name="role"
							value={formData.role}
							onChange={handleChange}
							required
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
						>
							<option value="Admin">Admin</option>
							<option value="Developer">Developer</option>
							<option value="Developer">Developer</option>
							<option value="Client">Client</option>
							<option value="Operation Manager">Operation Manager</option>
						</select>
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
							Password
						</label>
						<div className="relative">
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								name="password"
								value={formData.password}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
								placeholder="Password"
							/>
							{/* Toggle Visibility Icon */}
							<span
								onClick={togglePasswordVisibility}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
							>
								{showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
							</span>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className={`w-full py-2 px-4 rounded-md text-white font-semibold transition duration-200 ${loading
							? 'bg-red-300 cursor-not-allowed'
							: 'bg-red-600 hover:bg-red-700'
							}`}
					>
						{loading ? 'Registering...' : 'Register'}
					</button>

					{/* {registerSuccess && <p className="text-green-600 text-center">Registration successful!</p>}
					{error && <p className="text-red-600 text-center">{error}</p>} */}
				</form>
			</div>
		</div>
	);
};

export default CreateUserForm;

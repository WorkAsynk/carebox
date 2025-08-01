import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import img from "../../assets/logo/logocareboxicon.png";
import { login } from "../../redux/actions/authActions";

const LoginForm = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { isAuthenticated, error, loading, user } = useSelector((state) => state.auth);

	console.log(user)

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated]);

	const handleLogin = (e) => {
		e.preventDefault();
		dispatch(login(email, password));
	};

	return (
		<div className="w-full lg:w-1/2 p-8 flex flex-col justify-center items-end gap-[20px]">
			<div className="flex justify-start items-start mb-[70px] rounded-sm bg-red-700">
				<img className="w-[5rem]" src={img} alt="Logo" />
			</div>

			<div className="w-full max-w-[100%] flex justify-center items-center">
				<div className="w-[80%]">
					<h1 className="text-4xl text-center font-bold mb-6">Login to your account</h1>
					{error && <p className="text-red-600 text-center mb-4">{error}</p>}

					<form onSubmit={handleLogin}>
						<label className="block mb-2 text-lg font-medium">Email</label>
						<input
							type="email"
							placeholder="Enter your email ID"
							className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<label className="block mb-2 text-lg font-medium">Password</label>
						<input
							type="password"
							placeholder="Enter your Password"
							className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<button
							type="submit"
							className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition"
							disabled={loading}
						>
							{loading ? "Processing..." : "Proceed"}
						</button>
					</form>

					<div className="text-lg mt-4 text-center">
						New to Carebox? <a href="#" className="text-blue-600 font-medium">Create an account</a>
					</div>
					<div className="text-lg mt-5 text-center">
						Need help? <a href="#" className="text-blue-600">Read FAQs</a>{" "}
						<span className="text-gray-400">|</span>{" "}
						<a href="#" className="text-blue-600">Raise a ticket</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginForm;

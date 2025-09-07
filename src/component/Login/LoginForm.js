import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import img from "../../assets/logo/logocareboxicon.png";
import { login } from "../../redux/actions/authActions";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const LoginForm = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showOverlay, setShowOverlay] = useState(false);
	const [overlayStatus, setOverlayStatus] = useState("loading"); // 'loading' | 'success'

	const { isAuthenticated, error, loading, user } = useSelector((state) => state.auth);

	console.log(user)

	useEffect(() => {
		if (loading) {
			setShowOverlay(true);
			setOverlayStatus("loading");
			return;
		}
		if (!loading && isAuthenticated) {
			setOverlayStatus("success");
			setShowOverlay(true);
			const t = setTimeout(() => {
				navigate("/", { state: { loginSuccess: true } });
			}, 800);
			return () => clearTimeout(t);
		}
		if (!loading && error) {
			setShowOverlay(false);
		}
	}, [loading, isAuthenticated, error]);

	const handleLogin = (e) => {
		e.preventDefault();
		setShowOverlay(true);
		setOverlayStatus("loading");
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
						<div className="relative mb-4">
							<input
								type={showPassword ? "text" : "password"}
								placeholder="Enter your Password"
								className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<button
								type="button"
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
								onClick={() => setShowPassword((prev) => !prev)}
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? <FaEyeSlash /> : <FaEye />}
							</button>
						</div>
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

			{showOverlay && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm text-center">
						{overlayStatus === "loading" && (
							<div className="flex flex-col items-center">
								<div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-gray-700 animate-spin mb-3"></div>
								<p className="text-gray-700 text-sm">Signing you in...</p>
							</div>
						)}
						{overlayStatus === "success" && (
							<div className="flex flex-col items-center">
								<CheckCircleIcon className="w-14 h-14 text-green-500" />
								<p className="text-gray-700 text-sm mt-2">Login successful</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default LoginForm;

import axios from "axios";
import {
	LOGIN_REQUEST,
	LOGIN_SUCCESS,
	LOGIN_FAILURE,
	LOGOUT,
	REGISTER_REQUEST,
	REGISTER_SUCCESS,
	REGISTER_FAILURE,
} from "../constants/authConstants";


// LOGIN
export const login = (email, password) => async (dispatch) => {
	dispatch({ type: LOGIN_REQUEST });

	try {
		const { data } = await axios.post(
			`${process.env.REACT_APP_API_URL}/api/auth/login`, // Use the environment variable here
			{ email, password },
			{
				headers: { "Content-Type": "application/json" },
			}
		);

		if (data.success) {
			localStorage.setItem("user", JSON.stringify(data));
			dispatch({ type: LOGIN_SUCCESS, payload: data });
		} else {
			dispatch({
				type: LOGIN_FAILURE,
				payload: data.message || "Invalid credentials",
			});
		}
	} catch (error) {
		dispatch({
			type: LOGIN_FAILURE,
			payload: error.response?.data?.message || "Login failed. Please try again.",
		});
	}
};

// LOGOUT
export const logout = () => (dispatch) => {
	localStorage.removeItem("user");
	dispatch({ type: LOGOUT });
};

// REGISTER ADMIN
export const registerAdmin = (formData) => async (dispatch) => {
	dispatch({ type: REGISTER_REQUEST });

	try {
		const config = {
			headers: { "Content-Type": "application/json" },
		};

		const { data } = await axios.post(
			`${process.env.REACT_APP_API_URL}/api/admin/registerNew`, // proxy handles this in development
			formData,
			config
		);

		if (data.success) {
			dispatch({ type: REGISTER_SUCCESS, payload: data.message });
		} else {
			dispatch({
				type: REGISTER_FAILURE,
				payload: data.message || "Registration failed",
			});
		}
	} catch (error) {
		dispatch({
			type: REGISTER_FAILURE,
			payload: error.response?.data?.message || "Something went wrong",
		});
	}
};

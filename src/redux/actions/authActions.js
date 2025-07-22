import axios from "axios";
import {
	LOGIN_REQUEST,
	LOGIN_SUCCESS,
	LOGIN_FAILURE,
	LOGOUT,
} from "../constants/authConstants";

export const login = (email, password) => async (dispatch) => {
	dispatch({ type: LOGIN_REQUEST });

	try {
		const config = {
			headers: { "Content-Type": "application/json" },
		};

		const { data } = await axios.post(
			"/api/auth/login", // proxy handles domain
			{ email, password },
			config
		);

		if (data.success) {
			localStorage.setItem("user", JSON.stringify(data)); // safe storage
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
			payload:
				error.response?.data?.message || "Login failed. Please try again.",
		});
	}
};

export const logout = () => (dispatch) => {
	localStorage.removeItem("user");
	dispatch({ type: LOGOUT });
};

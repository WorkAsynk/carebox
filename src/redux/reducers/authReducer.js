import {
	LOGIN_REQUEST,
	LOGIN_SUCCESS,
	LOGIN_FAILURE,
	LOGOUT,
	REGISTER_REQUEST,
	REGISTER_SUCCESS,
	REGISTER_FAILURE,
} from "../constants/authConstants";

// Safe user load from localStorage
let userFromStorage = null;
let isAuthenticatedFromStorage = false;
try {
	const storedUser = localStorage.getItem("user");
	const parsed = storedUser ? JSON.parse(storedUser) : null;
	userFromStorage = parsed?.user || null;
	isAuthenticatedFromStorage = Boolean(parsed?.success);
} catch (error) {
	console.warn("Invalid JSON in localStorage:", error);
	userFromStorage = null;
	isAuthenticatedFromStorage = false;
}

const initialState = {
	loading: false,
	isAuthenticated: isAuthenticatedFromStorage,
	user: userFromStorage,
	error: null,
};

export const authReducer = (state = initialState, action) => {
	switch (action.type) {
		case LOGIN_REQUEST:
			return { ...state, loading: true, error: null };

		case LOGIN_SUCCESS:
			return {
				...state,
				loading: false,
				isAuthenticated: Boolean(action.payload?.success),
				user: action.payload?.user || null,
				error: null,
			};

		case LOGIN_FAILURE:
			return {
				...state,
				loading: false,
				isAuthenticated: false,
				user: null,
				error: action.payload,
			};

		case LOGOUT:
			return {
				loading: false,
				isAuthenticated: false,
				user: null,
				error: null,
			};
		case REGISTER_REQUEST:
			return { ...state, loading: true, error: null };

		case REGISTER_SUCCESS:
			return {
				...state,
				loading: false,
				registerSuccess: true,
				error: null,
			};

		case REGISTER_FAILURE:
			return {
				...state,
				loading: false,
				registerSuccess: false,
				error: action.payload,
			};

		default:
			return state;

	}

};



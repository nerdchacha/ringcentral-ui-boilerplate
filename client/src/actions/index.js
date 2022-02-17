import { push } from 'connected-react-router';

import * as ringcentral from '../ringcentral';
import { ROUTES } from '../constants';

export const AUTH_SET_LOGGED_IN = 'AUTH_SET_LOGGED_IN';
export const AUTH_SET_LOGIN_DETAILS = 'AUTH_SET_LOGIN_DETAILS';
export const AUTH_SET_ACCESS_TOKEN = 'AUTH_SET_ACCESS_TOKEN';
export const GLOBAL_SET_IS_LOADING = 'GLOBAL_SET_IS_LOADING';
export const ENQUEUE_SNACKBAR = 'ENQUEUE_SNACKBAR';
export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR';
export const REMOVE_SNACKBAR = 'REMOVE_SNACKBAR';

export const setLoggedIn = (isLoggedIn) => ({ type: AUTH_SET_LOGGED_IN, isLoggedIn });
export const setLoginDetails = (details, source) => ({ type: AUTH_SET_LOGIN_DETAILS, details, source });
export const setAccessToken = (token) => ({ type: AUTH_SET_ACCESS_TOKEN, token });
export const globalSetIsLoading = (isLoading) => ({ type: GLOBAL_SET_IS_LOADING, isLoading });

export const login = (loginType) => async (dispatch, getState) => {
	const {
		auth: { loginDetails },
	} = getState();
	const details = loginType === 'password' ? loginDetails.password : loginDetails.oauth;
	const { serverUrl, clientId, clientSecret, username, password, extension } = details;
	try {
		ringcentral.setup({ serverUrl, clientId, clientSecret });
		if (loginType === 'password') {
			dispatch(globalSetIsLoading(true, 'auth'));
		}
		const token = await ringcentral.login({ type: loginType, username, password, extension });
		dispatch(setLoggedIn(true));
		dispatch(setAccessToken(token));
		dispatch(globalSetIsLoading(false));
		dispatch(push(ROUTES.MAIN));
	} catch (e) {
		dispatch(notifier.error(`Error while logging in. ${e.message}`));
		dispatch(setLoggedIn(false));
		dispatch(globalSetIsLoading(false));
		dispatch(setAccessToken({}));
	}
};

export const loginUsingAccessToken = () => async (dispatch, getState) => {
	const {
		auth: { loginDetails, isLoggedIn, token, type: loginType },
		router: { location },
	} = getState();
	if (!isLoggedIn) {
		return;
	}
	const { serverUrl, clientId, clientSecret } = loginDetails[loginType];
	ringcentral.setup({ serverUrl, clientId, clientSecret });
	dispatch(globalSetIsLoading(true));
	try {
		await ringcentral.setToken(token);
		dispatch(setLoggedIn(true));
		dispatch(push(location.pathname));
	} catch (e) {
		dispatch(notifier.error(`Error while logging in. ${e.message}`));
		dispatch(setLoggedIn(false));
		dispatch(setAccessToken({}));
	} finally {
		dispatch(globalSetIsLoading(false));
	}
};

export const logout = () => async (dispatch) => {
	dispatch(globalSetIsLoading(true));
	try {
		await ringcentral.logout();
		dispatch(push(ROUTES.LOGIN));
	} catch (e) {
		dispatch(notifier.error(`Error while logging out. ${e.message}`));
	}
	dispatch(globalSetIsLoading(false));
	dispatch(setLoggedIn(false));
	dispatch(setAccessToken({}));
};

export const enqueueSnackbar = (notification) => {
	const key = notification.options && notification.options.key;
	return { type: ENQUEUE_SNACKBAR, notification: { ...notification, key: key || new Date().getTime() + Math.random() } };
};

export const closeSnackbar = (key) => ({ type: CLOSE_SNACKBAR, dismissAll: !key, key });

export const removeSnackbar = (key) => ({ type: REMOVE_SNACKBAR, key });

export const notifier = {
	success: (message) => enqueueSnackbar({ message, options: { variant: 'success' } }),
	error: (message) => enqueueSnackbar({ message, options: { variant: 'error' } }),
	info: (message) => enqueueSnackbar({ message, options: { variant: 'info' } }),
	warn: (message) => enqueueSnackbar({ message, options: { variant: 'warn' } }),
};

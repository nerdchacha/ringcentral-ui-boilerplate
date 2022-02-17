import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import authReducer from './auth';
import globalReducer from './global';
import notificationReducer from './notification';

const createRootReducer = (history) =>
	combineReducers({
		auth: authReducer,
		global: globalReducer,
		notification: notificationReducer,
		router: connectRouter(history),
	});

export default createRootReducer;

import { configureStore } from '@reduxjs/toolkit';
import organisationReducer from '../features/organisation/organisationSlice';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
	key: 'root',
	storage,
};

const persistedOrganisationReducer = persistReducer(persistConfig, organisationReducer);

export const store = configureStore({
	reducer: {
		organisation: persistedOrganisationReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export const persistor = persistStore(store);

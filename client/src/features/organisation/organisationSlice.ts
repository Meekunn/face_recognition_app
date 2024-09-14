import { createSlice } from '@reduxjs/toolkit';

export const organisationSlice = createSlice({
	name: 'organisation',
	initialState: {
		organisation: {
			id: '',
			name: '',
			email: '',
			isAuthenticated: localStorage.getItem('isAuthenticated'),
		},
	} as OrganisationState,
	reducers: {
		signup: (state, action) => {
			state.organisation = { ...state.organisation, ...action.payload };
		},
		signin: (state, action) => {
			state.organisation = action.payload;
		},
		logout: (state) => {
			state.organisation = {
				id: '',
				name: '',
				email: '',
				isAuthenticated: '',
			};
		},
	},
});

export const { signin, logout, signup } = organisationSlice.actions;

export const selectOrganisation = (state: { organisation: OrganisationState }) => state.organisation.organisation;

export default organisationSlice.reducer;

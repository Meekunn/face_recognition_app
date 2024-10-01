import axios from 'axios';

const Api = axios.create({
	baseURL: 'http://127.0.0.1:5000/',
});

// Api.interceptors.request.use(
// 	(config: InternalAxiosRequestConfig<any>) => {
// 		if (Auth.isAuthenticated()) {
// 			config.headers['Authorization'] = `Bearer ${Auth.getAccessToken()}`;
// 		}
// 		return config;
// 	},
// 	(error) => Promise.reject(error)
// );

// Api.interceptors.response.use(
// 	(response) => response,
// 	async (error) => {
// 		const originalRequest = error.config;

// 		if (error.response.status === 401 && !originalRequest._retry) {
// 			originalRequest._retry = true;

// 			try {
// 				const refreshToken = Auth.getRefreshToken();
// 				const response = await axios.post('companies/refresh_token', {
// 					refresh_token: refreshToken,
// 				});
// 				const { refresh_token } = response.data;
// 				const { access_token } = response.data;

// 				Auth.setRefreshToken(refresh_token);
// 				Auth.setAccessToken(access_token);

// 				// Retry the original request with the new token
// 				originalRequest.headers.Authorization = `Bearer ${refresh_token}`;
// 				return axios(originalRequest);
// 			} catch (error) {
// 				console.log(error);
// 				window.location.replace(authPaths.SIGNIN);
// 				// Handle refresh token error or redirect to login
// 			}
// 		}

// 		return Promise.reject(error);
// 	}
// );

export default Api;

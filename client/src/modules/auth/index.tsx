import { Navigate, Route, Routes } from 'react-router-dom';
import Authentication from './Outlet';
import { authPaths } from '../../routes/paths';
import SignIn from './SignIn';
import SignUp from './SignUp';

function AuthRoutes() {
	return (
		<Routes>
			<Route path={authPaths.BASE} element={<Authentication />}>
				<Route path={authPaths.BASE} element={<Navigate to={authPaths.SIGNIN} replace />} />
				<Route path={authPaths.SIGNIN} element={<SignIn />} />
				<Route path={authPaths.SIGNUP} element={<SignUp />} />
				{/* <Route path={authPaths.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
				<Route path={authPaths.RESET_PASSWORD} element={<ResetPasswordPage />} /> */}
			</Route>
		</Routes>
	);
}

export default AuthRoutes;

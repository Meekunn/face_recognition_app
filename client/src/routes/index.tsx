import { Fragment, Suspense } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import routes from './routes';
import ProtectedRoutes from './ProtectedRoutes';
import ErrorPage from './ErrorPage';
import Loader from '../reusables/Loader';

const renderRoutes = ({ component: Component, ...route }: IBaseRoutes) => {
	const PrivateRoute = (route.isProtected ? ProtectedRoutes : Fragment) as React.ElementType;
	const Layout = (route.layout ? route.layout : Fragment) as React.ElementType;
	return (
		<Route
			key={route.path}
			path={route.path}
			element={
				<Layout>
					<Suspense fallback={<Loader />}>
						<PrivateRoute>
							<Component />
						</PrivateRoute>
					</Suspense>
				</Layout>
			}
		/>
	);
};

export default function AppRoutes() {
	return (
		<Router>
			<Routes>
				{routes?.map((v) => renderRoutes(v))}
				<Route
					path="404"
					//element={<div>No match</div>}
					element={<ErrorPage />}
				/>
				<Route path="*" element={<div>No match</div>} />
			</Routes>
		</Router>
	);
}

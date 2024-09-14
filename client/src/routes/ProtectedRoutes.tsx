import { Box, CircularProgress } from '@chakra-ui/react';
import { Navigate } from 'react-router-dom';
import { authPaths } from './paths';

interface IProtectedRoutes {
	children: JSX.Element;
}

const ProtectedRoutes = ({ children }: IProtectedRoutes) => {
	// this would be dynamic when app auth is setUp
	const isLoading = false;
	const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

	if (isLoading) {
		return (
			<Box display="flex" alignItems="center" justifyContent="center" sx={{ height: '100vh', w: 1 }}>
				<CircularProgress color="brand.primary" />
			</Box>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to={authPaths.SIGNIN} />;
	}

	return children;
};

export default ProtectedRoutes;

import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './Outlet';
import { superAdminPaths } from '../../routes/paths';
import { stripBasePath } from '../../utils/routeManager';
import EventsPage from './EventsPage';
import NewEvent from './components/NewEvent';
import AddInvitee from './AddInvitee';
import EventPage from './EventPage';
import AttendanceLogs from './AttendanceLogs';

function SuperAdminRoutes() {
	const location = useLocation();
	return (
		<Routes>
			<Route path={superAdminPaths.BASE} element={<Dashboard />}>
				<Route path={superAdminPaths.BASE} element={<Navigate to={superAdminPaths.EVENTS} replace />} />
				<Route path={stripBasePath(superAdminPaths.EVENTS)} element={<EventsPage />} />
				<Route path={stripBasePath(superAdminPaths.EVENT)} element={<EventPage />} />
				<Route path={stripBasePath(superAdminPaths.NEW_EVENT)} element={<NewEvent />} />
				<Route path={stripBasePath(superAdminPaths.ATTENDANCE_LOG)} element={<AttendanceLogs />} />
				<Route path={stripBasePath(superAdminPaths.ADD_INVITEES)} element={<AddInvitee />} />
				<Route path="*" element={<Navigate to="/404" replace state={{ from: location.pathname }} />} />
			</Route>
		</Routes>
	);
}

export default SuperAdminRoutes;

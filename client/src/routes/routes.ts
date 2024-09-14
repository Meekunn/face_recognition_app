import UserAdminLayout from '../layout/SuperAdminLayout';
import React from 'react';

const routes: IBaseRoutes[] = [
	{
		path: '/*',
		exact: true,
		component: React.lazy(() => import('../modules/auth')),
		isProtected: false,
	},
	{
		path: '/superAdmin/*',
		exact: true,
		component: React.lazy(() => import('../modules/superAdmin')),
		isProtected: true,
		layout: UserAdminLayout,
	},
];

export default routes;

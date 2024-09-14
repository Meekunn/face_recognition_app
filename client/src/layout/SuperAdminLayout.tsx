import Navigation from '../reusables/Navigation';
import { LinkItemProps } from '../reusables/Navigation/types';
import { SettingsIcon } from '../reusables/icons';
import { superAdminPaths } from '../routes/paths';
import { BsCalendar2EventFill } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa';
import { IoPersonAdd } from 'react-icons/io5';
import { TbLogs } from 'react-icons/tb';

const linkItems: Array<LinkItemProps> = [
	{
		title: 'Events',
		path: superAdminPaths.EVENTS,
		icon: BsCalendar2EventFill,
	},
	{
		title: 'Add Invitees',
		path: superAdminPaths.ADD_INVITEES,
		icon: IoPersonAdd,
	},
	{
		title: 'Attendance Log',
		path: superAdminPaths.ATTENDANCE_LOG,
		icon: TbLogs,
	},
	{
		title: 'Profile',
		path: '',
		icon: FaUser,
		position: 'bottom',
	},
	{
		title: 'Settings',
		path: superAdminPaths.SETTINGS,
		icon: SettingsIcon,
		position: 'bottom',
	},
];

const SuperAdminLayout = ({ children }: { children?: React.ReactNode }) => {
	return <Navigation linkItems={linkItems}>{children}</Navigation>;
};

export default SuperAdminLayout;

import { IconType } from 'react-icons';

export interface LinkItemProps {
	title: string;
	path: string;
	icon: IconType;
	position?: 'bottom' | 'top';
}

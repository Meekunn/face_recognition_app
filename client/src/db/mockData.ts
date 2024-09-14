import DummyPicture from '../assets/avatar.png';

export type IInvitee = {
	uid: string;
	name: string;
	phone_number: string;
	image: string;
};

export const invitees: IInvitee[] = [
	{
		name: 'Oluwaseun Adedamola',
		phone_number: '09064877245',
		image: DummyPicture,
		uid: '0112',
	},
	{
		name: 'Oluwaseun Adedamola',
		phone_number: '09064877245',
		image: DummyPicture,
		uid: '0114',
	},
];

export const generateUID = () => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let uid = '';
	for (let i = 0; i < 10; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		uid += characters[randomIndex];
	}
	return uid;
};

export function padTime(time: string) {
	const [hour, minute, second] = time.split(':');
	return `${hour.padStart(2, '0')}:${minute}:${second || '00'}`; // Ensure seconds are included
}

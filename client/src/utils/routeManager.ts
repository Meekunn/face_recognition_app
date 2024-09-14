// For utility functions used to manipulate routes and paths

export const stripBasePath = (path: string) => {
	return `/${path.split('/').splice(2).join('/')}`;
};

export const navigateBackToRoot = (path: string) => {
	return `/${path.split('/')[1]}`;
};

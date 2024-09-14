export const NAME_REGEX = /^[a-zA-Z\s]+$/;
// export const NAME_REGEX = /^[A-Za-z-]+\s?[A-Za-z-]*$/;
export const PHONE_REGEX = /^(\+\d{1,3})?(\d{10,})$/;
export const EMAIL_REGEX = /^[A-Za-z0-9_\-.]{4,}[@][a-z]+[.][a-z]{2,3}$/;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!#$%&\-.,:;=?@\\^_|/~]).{8,}$/;

export const isEmail = (value: string): boolean => {
	return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
};

import { Button, HStack, Heading, Text, VStack, Link as ChakraLink } from '@chakra-ui/react';
import Auth from './components/Auth';
import CustomInputBox from '../../reusables/Input/CustomInputBox';
import { useFormik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { authPaths, superAdminPaths } from '../../routes/paths';
import * as Yup from 'yup';
import { EMAIL_REGEX, NAME_REGEX, PASSWORD_REGEX } from '../../utils/regex';
import Api from '../../api';
import useCustomToast from '../../hooks/useCustomToast';
import { useDispatch } from 'react-redux';
import { signup } from '../../features/organisation/organisationSlice';

interface ISignUpForm {
	email: string;
	name: string;
	password: string;
	confirmPassword: string;
}

const SignUp = () => {
	const showToast = useCustomToast();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const formik = useFormik<ISignUpForm>({
		initialValues: {
			email: '',
			name: '',
			password: '',
			confirmPassword: '',
		},
		validationSchema: Yup.object({
			email: Yup.string().required('Enter your email').matches(EMAIL_REGEX, 'Enter a valid account email'),
			name: Yup.string().required('Enter Your Full Name').matches(NAME_REGEX, 'Enter a valid name'),
			password: Yup.string()
				.required('Enter your current password')
				.matches(PASSWORD_REGEX, 'Password 8+ characters, 1+ uppercase, 1+ digit, 1+ special (!#$%&-.,:;=?@^_|/~).'),
			confirmPassword: Yup.string()
				.oneOf([Yup.ref('password'), undefined], 'Passwords must match')
				.required('Password confirm is required'),
		}),
		onSubmit: async (values, { setSubmitting }) => {
			try {
				const response = await Api.post('signup', {
					email: values.email,
					name: values.name,
					password: values.password,
				});
				localStorage.setItem('isAuthenticated', 'true');
				dispatch(
					signup({
						id: response.data.id,
						name: values.name,
						email: values.email,
						isAuthenticated: localStorage.getItem('isAuthenticated'),
					})
				);
				formik.resetForm();
				navigate(superAdminPaths.EVENTS);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} catch (error: any) {
				// console.log(error);
				showToast({
					title: 'Failed to Create Account',
					description: `${error.response.status === 409 ? 'Email already exists' : 'An error occured'}`,
					status: 'error',
					duration: 3000,
				});
			} finally {
				setSubmitting(false);
			}
		},
	});

	return (
		<Auth>
			<VStack
				bgColor={'brand.bgLight'}
				display={'flex'}
				borderRadius={'md'}
				justify={'center'}
				gap={6}
				w="400px"
				h="fit-content"
				p={6}
			>
				<Heading as="h1" variant="formHeading" fontWeight={'semibold'} fontSize="3xl" textAlign="center">
					Sign Up
				</Heading>
				<form
					onSubmit={formik.handleSubmit}
					style={{ width: '100%', gap: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
				>
					<VStack gap={2} w="100%">
						<CustomInputBox
							hasFieldset={true}
							isRequired={true}
							onFocusLabelColor="brand.primary"
							onFocusBorderColor="brand.primary"
							onBlur={formik.handleBlur}
							onChange={formik.handleChange}
							value={formik.values.name}
							name="name"
							label="Full Name"
							placeholder="John Dee"
							type="text"
							color={'brand.textGray'}
							fontSize="xs"
							width="100%"
							errMsg={formik.errors.name}
						/>
						<CustomInputBox
							hasFieldset={true}
							isRequired={true}
							onFocusLabelColor="brand.primary"
							onFocusBorderColor="brand.primary"
							onBlur={formik.handleBlur}
							onChange={formik.handleChange}
							value={formik.values.email}
							name="email"
							label="Email"
							placeholder="John"
							type="email"
							color={'brand.textGray'}
							fontSize="xs"
							width="100%"
							errMsg={formik.errors.email}
						/>
						<CustomInputBox
							hasFieldset={true}
							isRequired={true}
							onFocusLabelColor="brand.primary"
							onFocusBorderColor="brand.primary"
							onBlur={formik.handleBlur}
							onChange={formik.handleChange}
							value={formik.values.password}
							name="password"
							label="Password"
							placeholder="******"
							autocomplete="current-password"
							type="password"
							color={'brand.textGray'}
							fontSize="xs"
							width="100%"
							errMsg={formik.errors.password}
						/>
						<CustomInputBox
							hasFieldset={true}
							isRequired={true}
							onFocusLabelColor="brand.primary"
							onFocusBorderColor="brand.primary"
							onBlur={formik.handleBlur}
							onChange={formik.handleChange}
							value={formik.values.confirmPassword}
							name="confirmPassword"
							label="Confirm Password"
							placeholder="******"
							type="password"
							color={'brand.textGray'}
							fontSize="xs"
							width="100%"
							errMsg={formik.errors.confirmPassword}
						/>
					</VStack>
					<Button type="submit" w="100%" mt="16px" isLoading={formik.isSubmitting}>
						Sign Up
					</Button>
					<HStack align="center" justify="space-between" fontSize="xs" w="full" mt={3}>
						<Text>
							Already have an account?{' '}
							<ChakraLink as={Link} to={authPaths.SIGNIN}>
								Sign In
							</ChakraLink>{' '}
						</Text>
					</HStack>
				</form>
			</VStack>
		</Auth>
	);
};

export default SignUp;

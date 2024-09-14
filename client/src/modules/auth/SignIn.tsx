import { Button, HStack, Heading, Text, VStack, Link as ChakraLink } from '@chakra-ui/react';
import Auth from './components/Auth';
import CustomInputBox from '../../reusables/Input/CustomInputBox';
import { useFormik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { authPaths, superAdminPaths } from '../../routes/paths';
import * as Yup from 'yup';
import validator from 'validator';
import useCustomToast from '../../hooks/useCustomToast';
import Api from '../../api';
import { useDispatch } from 'react-redux';
import { signin } from '../../features/organisation/organisationSlice';

interface ISignInForm {
	email: string;
	password: string;
}

const SignIn = () => {
	const showToast = useCustomToast();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const formik = useFormik<ISignInForm>({
		initialValues: {
			email: '',
			password: '',
		},
		validationSchema: Yup.object({
			email: Yup.string()
				.required('Enter your email')
				.test({
					test: (values) => validator.isEmail(values as string),
					message(params) {
						return `${params.value} is  not a valid email`;
					},
				}),
			password: Yup.string().required('Password is required'),
		}),
		onSubmit: async (values, { setSubmitting }) => {
			try {
				const response = await Api.post('signin', {
					email: values.email,
					password: values.password,
				});
				formik.resetForm();
				localStorage.setItem('isAuthenticated', 'true');
				dispatch(
					signin({
						id: response.data.id,
						name: response.data.name,
						email: values.email,
						isAuthenticated: localStorage.getItem('isAuthenticated'),
					})
				);
				navigate(superAdminPaths.EVENTS);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} catch (error: any) {
				// console.log(error);
				showToast({
					title: 'Sign In Unsuccessful',
					description: `${
						error.response.status === 404
							? 'User not found'
							: error.response.status === 401
							? 'Invalid email or password'
							: 'An error occured'
					}`,
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
			<VStack bgColor={'brand.bgLight'} display={'flex'} borderRadius={'md'} justify={'center'} gap={6} w="400px" h="400px" p={6}>
				<Heading as="h1" variant="formHeading" fontWeight={'semibold'} fontSize="3xl" textAlign="center">
					Sign In
				</Heading>
				<form
					onSubmit={formik.handleSubmit}
					style={{ width: '100%', gap: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
				>
					<VStack gap={4} w="100%">
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
							// autocomplete="current-password"
							type="password"
							color={'brand.textGray'}
							fontSize="xs"
							width="100%"
							errMsg={formik.errors.password}
						/>
					</VStack>
					<Button type="submit" w="100%" mt="16px" isLoading={formik.isSubmitting}>
						Sign in
					</Button>
					<HStack align="center" justify="space-between" fontSize="xs" w="full" mt={3}>
						<ChakraLink as={Link}>Forgot Password?</ChakraLink>
						<Text>
							Don't have an account?{' '}
							<ChakraLink as={Link} to={authPaths.SIGNUP}>
								Sign Up
							</ChakraLink>{' '}
						</Text>
					</HStack>
				</form>
			</VStack>
		</Auth>
	);
};

export default SignIn;

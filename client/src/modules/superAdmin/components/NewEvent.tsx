import { Button, Flex, Heading, VStack } from '@chakra-ui/react';
import NavCrumbBar from '../../../reusables/NavCrumbBar';
import { superAdminPaths } from '../../../routes/paths';
import CustomInputBox from '../../../reusables/Input/CustomInputBox';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import Api from '../../../api';
import { IEventForm } from '../types';
import { useNavigate } from 'react-router-dom';
import useCustomToast from '../../../hooks/useCustomToast';
import { useSelector } from 'react-redux';
import { selectOrganisation } from '../../../features/organisation/organisationSlice';

const crumbItems: ICrumbItems[] = [
	{
		name: 'Events',
		path: superAdminPaths.EVENTS,
	},
	{
		name: 'New Event',
		path: superAdminPaths.NEW_EVENT,
	},
];

const NewEvent = () => {
	const navigate = useNavigate();
	const showToast = useCustomToast();
	const minDate = dayjs().format('YYYY-MM-DD');

	const organisation = useSelector(selectOrganisation);

	const formik = useFormik<IEventForm>({
		initialValues: {
			event_name: '',
			start_time: '',
			end_time: '',
			location: '',
			event_date: '',
			threshold: '30',
		},
		validationSchema: Yup.object({
			event_name: Yup.string().required('This Field is Required'),
			event_date: Yup.string().required('This Field is Required'),
			start_time: Yup.string().required('This Field is Required'),
			end_time: Yup.string().required('This Field is Required'),
			location: Yup.string().required('This Field is Required'),
			threshold: Yup.string().required('This Field is Required'),
		}),
		onSubmit: async (values) => {
			Api.post('register-event', {
				event_name: values.event_name,
				event_date: values.event_date,
				start_time: values.start_time,
				end_time: values.end_time,
				location: values.location,
				threshold: parseInt(values.threshold),
				organisation_id: organisation.id,
			})
				.then((response) => {
					console.log(response);
					showToast({
						title: 'New Event created.',
						description: "We've created a new event for you.",
						status: 'success',
						duration: 3000,
					});
					formik.resetForm();
					setTimeout(() => {
						navigate(superAdminPaths.ADD_INVITEES);
					}, 2000);
				})
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.catch((error: any) => {
					showToast({
						title: 'Error Occurred.',
						description: `${error.response.status === 404 ? 'Invalid organisation ID' : 'Something went Wrong'}`,
						status: 'error',
						duration: 9000,
					});
				});
		},
	});

	return (
		<>
			<NavCrumbBar crumbItems={crumbItems} />
			<VStack gap={4} boxShadow="0px 0px 1px 0px #BBBBBB" py={8}>
				<form onSubmit={formik.handleSubmit}>
					<VStack gap={6} width={{ base: '363px', md: '640px', xl: '792px' }} p={6}>
						<Heading variant="formHeading" pb={2}>
							Event Information
						</Heading>
						<CustomInputBox
							hasFieldset={true}
							isRequired={true}
							onFocusLabelColor="brand.primary"
							onFocusBorderColor="brand.primary"
							onBlur={formik.handleBlur}
							onChange={formik.handleChange}
							value={formik.values.event_name}
							name="event_name"
							label="Name of Event"
							placeholder="School Seminar"
							type="text"
							color={'brand.textGray'}
							fontSize="sm"
							width="100%"
							errMsg={formik.errors.event_name}
							labelSize="sm"
						/>
						<CustomInputBox
							hasFieldset={true}
							isRequired={true}
							onFocusLabelColor="brand.primary"
							onFocusBorderColor="brand.primary"
							onBlur={formik.handleBlur}
							onChange={formik.handleChange}
							value={formik.values.location}
							name="location"
							label="Location"
							placeholder="School Seminar"
							type="text"
							color={'brand.textGray'}
							fontSize="sm"
							width="100%"
							labelSize="sm"
							errMsg={formik.errors.location}
						/>
						<CustomInputBox
							hasFieldset={true}
							isRequired={true}
							onFocusLabelColor="brand.primary"
							onFocusBorderColor="brand.primary"
							onBlur={formik.handleBlur}
							onChange={formik.handleChange}
							value={formik.values.event_date}
							name="event_date"
							label="Date"
							placeholder="School Seminar"
							type="date"
							color={'brand.textGray'}
							fontSize="sm"
							width="100%"
							labelSize="sm"
							errMsg={formik.errors.event_date}
							minDate={minDate}
						/>
						<CustomInputBox
							hasFieldset={true}
							isRequired={true}
							onFocusLabelColor="brand.primary"
							onFocusBorderColor="brand.primary"
							onBlur={formik.handleBlur}
							onChange={formik.handleChange}
							value={formik.values.start_time}
							name="start_time"
							label="Start Time"
							placeholder="School Seminar"
							type="time"
							color={'brand.textGray'}
							fontSize="sm"
							width="100%"
							labelSize="sm"
							errMsg={formik.errors.start_time}
						/>
						<CustomInputBox
							hasFieldset={true}
							isRequired={true}
							onFocusLabelColor="brand.primary"
							onFocusBorderColor="brand.primary"
							onBlur={formik.handleBlur}
							onChange={formik.handleChange}
							value={formik.values.end_time}
							name="end_time"
							label="End Time"
							placeholder="School Seminar"
							type="time"
							color={'brand.textGray'}
							fontSize="sm"
							width="100%"
							labelSize="sm"
							errMsg={formik.errors.end_time}
						/>
						<CustomInputBox
							hasFieldset={true}
							isRequired={true}
							onFocusLabelColor="brand.primary"
							onFocusBorderColor="brand.primary"
							onBlur={formik.handleBlur}
							onChange={formik.handleChange}
							value={formik.values.threshold}
							name="threshold"
							label="Attendance Threshold (minutes)"
							placeholder="30"
							type="text"
							color={'brand.textGray'}
							fontSize="sm"
							width="100%"
							labelSize="sm"
							errMsg={formik.errors.threshold}
						/>
						<Flex justify={{ base: 'center', md: 'flex-end' }} w="100%">
							<Button fontWeight="semibold" type="submit">
								Create Event
							</Button>
						</Flex>
					</VStack>
				</form>
			</VStack>
		</>
	);
};

export default NewEvent;

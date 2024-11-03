import { Avatar, Box, Button, HStack, Heading, Icon, Select, Text, VStack, useDisclosure } from '@chakra-ui/react';
import CustomTable from '../../reusables/CustomTable';
import NavCrumbBar from '../../reusables/NavCrumbBar';
import { superAdminPaths } from '../../routes/paths';
import { useEffect, useState } from 'react';
import { IEvent, IAttendeeLog, IInvitee } from './types';
import { useSelector } from 'react-redux';
import { selectOrganisation } from '../../features/organisation/organisationSlice';
import Api from '../../api';
import useCustomToast from '../../hooks/useCustomToast';
import { createColumnHelper } from '@tanstack/react-table';
import AttendeeLog from './components/AttendeeLog';
import { PiDotsThreeOutlineFill } from 'react-icons/pi';
import { FaCircleCheck } from 'react-icons/fa6';
import { FaTimesCircle } from 'react-icons/fa';
import { FiDownload } from 'react-icons/fi';
import { padTime } from '../../utils/helperFunctions';

const columnHelper = createColumnHelper<IInvitee>();

const AttendanceLogs = () => {
	const showToast = useCustomToast();
	const { isOpen, onClose, onOpen } = useDisclosure();
	const organisation = useSelector(selectOrganisation);

	const [events, setEvents] = useState<IEvent[]>([]);
	const [attendees, setAttendees] = useState<IInvitee[]>([]);
	const [selectedEvent, setSelectedEvent] = useState('');
	const [selectedEventName, setSelectedEventName] = useState('');
	const [selectedAttendee, setSelectedAttendee] = useState<IInvitee | null>(null);
	const [logs, setLogs] = useState<IAttendeeLog>({ arrivals: [], departures: [] });
	const [eventStartDateTime, setEventStartDateTime] = useState(new Date());
	const [eventEndDateTime, setEventEndDateTime] = useState(new Date());
	const [startTime, setStartTime] = useState('');

	const currentDateTime = new Date();

	const eventStarted = new Date(eventStartDateTime);
	eventStarted.setMinutes(eventStarted.getMinutes() - 5);

	const eventEnded = new Date(eventEndDateTime);
	eventEnded.setMinutes(eventEnded.getMinutes() + 1);
	// console.log(currentDateTime);
	// console.log(eventEnded);
	// console.log(currentDateTime > eventEnded);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const response = await Api.get(`get-events/${organisation.id}`);
				setEvents(response.data);
			} catch (error) {
				
				showToast({
					title: 'Error Occurred.',
					description: 'An error occured while fetching events.',
					status: 'error',
					duration: 5000,
				});
			}
		};

		fetchEvents();
	}, [organisation.id]);

	useEffect(() => {
		if (selectedEvent) {
			const fetchAttendees = async () => {
				try {
					const response = await Api.get(`get-attendees/${selectedEvent}`);
					setAttendees(response.data.attendees);
					setStartTime(response.data.event_start_time);
					setSelectedEventName(response.data.event_name);
					setEventStartDateTime(new Date(`${response.data.event_date}T${padTime(response.data.event_start_time)}`));
					setEventEndDateTime(new Date(`${response.data.event_date}T${padTime(response.data.event_end_time)}`));
				} catch (error) {
					console.error('Error fetching attendees:', error);
				}
			};

			fetchAttendees();
		}
	}, [selectedEvent]);

	const crumbItems: ICrumbItems[] = [
		{
			name: 'Attendance Logs',
			path: superAdminPaths.ATTENDANCE_LOG,
		},
		{
			name: selectedEventName ? `${selectedEventName} Attendees` : 'Attendees',
			path: '#',
		},
	];

	const columns = [
		columnHelper.display({
			id: 'serialNumber',
			header: () => 'S/N',
			cell: (info) => info.row.index + 1,
		}),
		columnHelper.accessor('photo', {
			header: () => 'Picture',
			cell: (info) => {
				return <Avatar size="sm" src={`http://localhost:5000/uploads/${selectedEvent}/${info.getValue()}`} />;
			},
		}),
		columnHelper.accessor('name', {
			header: () => 'Name',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('invitee_id', {
			cell: (info) => info.getValue(),
			header: () => 'UID',
		}),
		columnHelper.accessor('phone_number', {
			header: () => 'Phone Number',
			cell: (info) => info.renderValue(),
		}),
		columnHelper.accessor('isAttended', {
			header: () => {
				// If the event is ongoing, show "Present"; otherwise show "Attended"
				return currentDateTime > eventStarted && currentDateTime < eventEnded ? 'Present' : 'Attended';
			},
			cell: (info) => {
				const isAttended = info.getValue();
				const isPresent = info.row.original.isPresent; // Assuming 'isPresent' is part of the row data

				// Show 'isPresent' if the event is ongoing
				if (currentDateTime > eventStarted && currentDateTime < eventEnded) {
					return isPresent ? (
						<Text color="green.500">True</Text> // Display 'True' for isPresent
					) : (
						<Text color="red.500">False</Text> // Display 'False' for isPresent
					);
				}
				// After event ends, show 'isAttended'
				else if (currentDateTime > eventEnded) {
					return isAttended ? 
					// (
					// 	<Icon as={PiDotsThreeOutlineFill} color="brand.primary" w={6} h={6} /> // Three dots icon to signify loading
					// ) : isAttended ? 
					(
						<Icon as={FaCircleCheck} color="green.500" w={6} h={6} /> // Checkmark if attended more than 30 minutes
					) : (
						<Icon as={FaTimesCircle} color="red.500" w={6} h={6} /> // Red cross if attended less than 30 minutes
					);
				}
			},
		}),
	];

	const handleRowClick = async (attendee: IInvitee) => {
		setSelectedAttendee(attendee);

		if (attendee.timestamps != null) {
			setLogs(attendee.timestamps);
		}

		onOpen();
	};

	const handleDownload = async () => {
		try {
			// Specify response type as 'blob' in Axios request
			const response = await Api.get(`/download-attendance-logs/${selectedEvent}`, {
				responseType: 'blob',
			});

			// Create a blob from the response data
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `${selectedEvent}_attendance.xlsx`);

			// Append link to body, trigger the download, and remove the link
			document.body.appendChild(link);
			link.click();
			link.remove();
		} catch (error) {
			showToast({
				title: 'Error Occurred.',
				description: 'Error downloading attendance log.',
				status: 'error',
				duration: 5000,
			});
		}
	};

	return (
		<>
			<NavCrumbBar crumbItems={crumbItems} />
			<VStack w="full" p={8} gap={4}>
				<HStack justify={'space-between'} w="full" align="center">
					<Box width="230px">
						<Select placeholder="Select event" required value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
							{events.map((event) => (
								<option value={event.event_id} key={event.event_id}>
									{event.event_name}
								</option>
							))}
						</Select>
					</Box>
					<Button rightIcon={<FiDownload />} onClick={handleDownload} display="flex" alignItems={'center'}>
						Download
					</Button>
				</HStack>
				{selectedEvent ? (
					startTime === '' ? (
						<Heading as={'h3'} fontSize="3xl" fontWeight="medium">
							Event has not started yet.
						</Heading>
					) : currentDateTime < eventStarted ? (
						<Heading as={'h3'} fontSize="3xl" fontWeight="medium">
							Event has not started yet.
						</Heading>
					) : (
						<CustomTable
							data={attendees}
							columns={columns}
							clickableRows={true}
							onRowClick={handleRowClick}
							placeholderText="Search Attendee"
							width="100%"
						/>
					)
				) : (
					<CustomTable
						data={[]}
						columns={columns}
						clickableRows={true}
						onRowClick={handleRowClick}
						placeholderText="Search Attendee"
						width="100%"
					/>
				)}
			</VStack>

			{selectedAttendee && (
				<AttendeeLog
					name={selectedAttendee.name}
					picture={`http://localhost:5000/uploads/${selectedEvent}/${selectedAttendee.photo}`}
					isOpen={isOpen}
					onClose={onClose}
					logs={logs}
				/>
			)}
		</>
	);
};

export default AttendanceLogs;

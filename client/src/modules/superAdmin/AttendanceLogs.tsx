import { Avatar, Box, HStack, Select, VStack, useDisclosure } from '@chakra-ui/react';
import CustomTable from '../../reusables/CustomTable';
import NavCrumbBar from '../../reusables/NavCrumbBar';
import { superAdminPaths } from '../../routes/paths';
import { useEffect, useState } from 'react';
import { IEvent, IAttendee, IAttendeeLog } from './types';
import { useSelector } from 'react-redux';
import { selectOrganisation } from '../../features/organisation/organisationSlice';
import Api from '../../api';
import useCustomToast from '../../hooks/useCustomToast';
import { createColumnHelper } from '@tanstack/react-table';
import AttendeeLog from './components/AttendeeLog';

const columnHelper = createColumnHelper<IAttendee>();

const AttendanceLogs = () => {
	const showToast = useCustomToast();
	const { isOpen, onClose, onOpen } = useDisclosure();
	const organisation = useSelector(selectOrganisation);

	const [events, setEvents] = useState<IEvent[]>([]);
	const [attendees, setAttendees] = useState<IAttendee[]>([]);
	const [selectedEvent, setSelectedEvent] = useState('');
	const [selectedEventName, setSelectedEventName] = useState('');
	const [selectedAttendee, setSelectedAttendee] = useState<IAttendee | null>(null);
	const [logs, setLogs] = useState<IAttendeeLog[]>([]);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const response = await Api.get(`get-events/${organisation.id}`);
				setEvents(response.data);
			} catch (error) {
				console.log(error);
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
					const response = await Api.get(`get-event-attendees/${selectedEvent}`);
					setAttendees(response.data.attendees);
					setSelectedEventName(response.data.event_name);
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
				return <Avatar size="sm" src={`http://localhost:8080/uploads/${info.getValue()}`} />;
			},
		}),
		columnHelper.accessor('name', {
			header: () => 'Name',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('attendee_id', {
			cell: (info) => info.getValue(),
			header: () => 'UID',
		}),
		columnHelper.accessor('phone_number', {
			header: () => 'Phone Number',
			cell: (info) => info.renderValue(),
		}),
	];

	const handleRowClick = async (attendee: IAttendee) => {
		setSelectedAttendee(attendee);
		onOpen();

		const response = await Api.get(`/get-attendance-logs/${attendee.attendee_id}`);
		setLogs(response.data);
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
				</HStack>
				<CustomTable
					data={attendees}
					columns={columns}
					clickableRows={true}
					onRowClick={handleRowClick}
					placeholderText="Search Attendee"
					width="100%"
				/>
			</VStack>

			{selectedAttendee && (
				<AttendeeLog
					name={selectedAttendee.name}
					picture={selectedAttendee.photo}
					isOpen={isOpen}
					onClose={onClose}
					logs={logs}
				/>
			)}
		</>
	);
};

export default AttendanceLogs;

import { MouseEvent, useEffect, useState } from 'react';
import NavCrumbBar from '../../reusables/NavCrumbBar';
import CrumbButton from '../../reusables/CrumbButton';
import { superAdminPaths } from '../../routes/paths';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../../reusables/CustomTable';
import { IconButton, VStack, useDisclosure } from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import { FiTrash2 } from 'react-icons/fi';
import { IEvent } from './types';
import Api from '../../api';
import CustomModal from '../../reusables/Feedbacks/CustomModal';
import useCustomToast from '../../hooks/useCustomToast';
import { useSelector } from 'react-redux';
import { selectOrganisation } from '../../features/organisation/organisationSlice';

const columnHelper = createColumnHelper<IEvent>();

const EventsPage = () => {
	const navigate = useNavigate();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const showToast = useCustomToast();

	const organisation = useSelector(selectOrganisation);

	const [events, setEvents] = useState<IEvent[]>([]);
	const [selectedEventId, setSelectedEventId] = useState<string>('');

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const response = await Api.get(`get-events/${organisation.id}`);
				setEvents(response.data);
			} catch (error) {
				console.log(error);
			}
		};

		fetchEvents();
	}, [organisation.id]);

	const handleDelete = async () => {
		if (selectedEventId) {
			try {
				await Api.delete('/delete-event', {
					data: { event_id: selectedEventId },
				});
				showToast({
					description: 'Event deleted successfully',
					status: 'success',
				});
				setEvents((prevEvents) => prevEvents.filter((event) => event.event_id !== selectedEventId));
			} catch (error) {
				console.log('There was an error deleting the event!', error);
				showToast({
					title: 'Failed to delete event.',
					description: 'There was an error deleting the event.',
					status: 'error',
				});
			} finally {
				onClose();
			}
		}
	};

	const handleDeleteClick = (event: MouseEvent<HTMLButtonElement>, eventId: string) => {
		event.stopPropagation();
		setSelectedEventId(eventId);
		onOpen();
	};

	const columns = [
		columnHelper.display({
			id: 'serialNumber',
			header: () => 'S/N',
			cell: (info) => info.row.index + 1,
		}),
		columnHelper.accessor((row) => row.event_name, {
			id: 'name',
			cell: (info) => info.getValue(),
			header: () => 'Name',
		}),
		columnHelper.accessor('event_date', {
			header: () => 'Date',
			cell: (info) => info.renderValue(),
		}),
		columnHelper.accessor('start_time', {
			header: () => 'Start Time',
			cell: (info) => info.renderValue(),
		}),
		columnHelper.accessor('end_time', {
			header: () => 'End Time',
			cell: (info) => info.renderValue(),
		}),
		columnHelper.accessor('location', {
			header: () => 'Location',
			cell: (info) => info.renderValue(),
		}),
		columnHelper.display({
			id: 'actions',
			header: 'Actions',
			cell: (info) => {
				const eventId = info.row.original.event_id;
				return (
					<IconButton
						aria-label="delete event"
						colorScheme="red"
						variant="ghost"
						fontSize="xl"
						onClick={(event) => handleDeleteClick(event, eventId)}
					>
						<FiTrash2 />
					</IconButton>
				);
			},
		}),
	];

	const handleNewEvent = () => {
		navigate(superAdminPaths.NEW_EVENT);
	};

	const handleRowClick = (event: IEvent) => {
		navigate(superAdminPaths.EVENT.replace(':id', event.event_id.toString()));
	};

	const crumbItems: ICrumbItems[] = [
		{
			name: 'Events',
			path: superAdminPaths.EVENTS,
		},
	];

	return (
		<>
			<NavCrumbBar
				crumbItems={crumbItems}
				button={<CrumbButton title="New Event" ariaLabel="Create New Event" icon={<FaPlus />} handleClick={handleNewEvent} />}
			/>
			<VStack w="full" p={8}>
				<CustomTable
					data={events}
					columns={columns}
					clickableRows={true}
					placeholderText="Search Event ..."
					onRowClick={handleRowClick}
				/>
			</VStack>
			<CustomModal
				isAction={true}
				title="Confirm Event Deletion"
				description="Are you sure you want to delete this event? This action cannot be undone."
				action={handleDelete}
				isOpen={isOpen}
				onClose={onClose}
				actionBtnText="Delete"
				status="warning"
			/>
		</>
	);
};

export default EventsPage;

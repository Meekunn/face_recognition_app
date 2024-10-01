export type IEventForm = {
	event_name: string;
	start_time: string;
	end_time: string;
	location: string;
	event_date: string;
	threshold: string;
};

export interface IEvent extends IEventForm {
	event_id: string;
}

export type IInvitee = {
	photo: string;
	photoFile: File | null;
	name: string;
	invitee_id?: string;
	phone_number: string;
	timestamps?: {
		arrivals: string[];
		departures: string[];
	};
	isAttended?: boolean | null;
};

export type IEventInvitees = {
	event_id: string;
	attendees_id: string[];
};

export interface IAttendee {
	photo: string;
	name: string;
	attendee_id: string;
	phone_number: string;
}

// export interface IAttendeeLog {
// 	log_id: string;
// 	timestamp: string;
// 	action: 'enter' | 'leave';
// }

export interface IAttendeeLog {
	arrivals: string[];
	departures: string[];
}

import React, { ChangeEvent } from 'react';
import Video, {
	Room, ConnectOptions, LocalTrack, Participant,
	LocalVideoTrack, LocalAudioTrack, LocalVideoTrackPublication,
	LocalAudioTrackPublication, RemoteAudioTrackPublication,
	RemoteVideoTrackPublication, RemoteTrackPublication
} from 'twilio-video';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';


export interface Props {

}

interface State {
	identity: string;
	roomName: string;
	roomNameErr: boolean;
	previewTracks?: LocalTrack[] | MediaStreamTrack[];
	localMediaAvailable: boolean;
	hasJoinedRoom: boolean;
	activeRoom?: Room;
	recording: boolean;
	token: string;
	downloadLink: string;
}

type AudioVideoTrackPublication = LocalAudioTrackPublication | LocalVideoTrackPublication | RemoteAudioTrackPublication | RemoteVideoTrackPublication;


export default function VideoComponent() {

	const [state, setState] = React.useState<State>({
		identity: '',
		roomName: 'Default',
		roomNameErr: false, // Track error for room name TextField
		token: '',
		localMediaAvailable: false,
		hasJoinedRoom: false,
		recording: false,
		downloadLink: ''
	});
	const localMediaRef = React.createRef<HTMLDivElement>();
	const remoteMediaRef = React.createRef<HTMLDivElement>();

	React.useEffect(()=>{
		axios.get('/token', getAxiosConfig()).then(results => {
			const { identity, token } = results.data;
			setState(Object.assign(state, { identity, token }));
		});
	});

	function handleRoomNameChange(e: ChangeEvent<HTMLInputElement>) {
		let roomName = e.target.value;
		setState(Object.assign(state, {roomName:roomName}));
	}

	function connect() {
		console.log("Joining room '" + state.roomName + "'...");
		const connectOptions: ConnectOptions =
		{
			name: state.roomName,
			video: { width: 720, height: 480 },
			audio: true
		};

		if (state.previewTracks) {
			connectOptions.tracks = state.previewTracks;
		}

		// Join the Room with the token from the server and the
		// LocalParticipant's Tracks.
		Video.connect(state.token, connectOptions).then(roomJoined, error => {
			alert('Could not connect to Twilio: ' + error.message);
		});
	}

	function joinRoom() {
		if (!state.roomName.trim()) {
			setState(Object.assign(state, { roomNameErr: true }));
			return;
		}

		axios.post('/createRoom', { "uniqueName": state.roomName }, getAxiosConfig()).then((response) => {
			connect();
		}).catch((error) => {
			//room already exist
			if (error && error.code === 53113) {
				connect();
			} else {
				console.log(error);
			}
		});

	}

	//Unable to fix the type of track
	function attachTrack(track: any, conatiner: Element) {
		console.log('Attach tracks');
		console.log(track);
		let newTrack: AudioVideoTrackPublication = track;
		if (newTrack.track) {
			conatiner.appendChild(newTrack.track.attach());
		}
	}

	function detachTrack(track: any) {
		let newTrack: AudioVideoTrackPublication = track;

		newTrack.track && newTrack.track.detach().forEach((detachedElement: HTMLElement) => {
			detachedElement.remove();
		})
	}


	// Attaches a track to a specified DOM container
	function attachParticipantTracks(participant: Participant, container: React.RefObject<HTMLDivElement>) {
		participant.tracks.forEach(track => attachTrack(track, container.current!))
	}

	function detachParticipantTracks(participant: Participant) {
		var tracks = Array.from(participant.tracks.values());
		tracks.forEach(track => {
			console.log(track.trackSid);
			let element = document.getElementById(track.trackSid);
			if (element) {
				element.remove();
			}
		});
	}

	function roomJoined(room: Video.Room) {

		// Called when a participant joins a room
		console.log("Joined as '" + state.identity + "'");

		setState(Object.assign(state, {
			activeRoom: room,
			localMediaAvailable: true,
			hasJoinedRoom: true
		}));

		// Attach LocalParticipant's Tracks, if not already attached.
		if (!localMediaRef.current!.querySelector('video')) {
			attachParticipantTracks(room.localParticipant, localMediaRef);
		}

		// Attach the Tracks of the Room's Participants.
		room.participants.forEach(onParticipantConnected);

		// When a Participant joins the Room, log the event.
		room.on('participantConnected', onParticipantConnected);

		// When a Participant leaves the Room, detach its Tracks.
		room.on('participantDisconnected', (participant: Participant) => {
			console.log("Participant '" + participant.identity + "' left the room");
			detachParticipantTracks(participant);
		});

		// Once the LocalParticipant leaves the room, detach the Tracks
		// of all Participants, including that of the LocalParticipant.
		room.on('disconnected', () => {
			if (state.previewTracks) {
				state.previewTracks!.forEach((track: any) => {
					let videoTrack: LocalVideoTrack | LocalAudioTrack = track;
					videoTrack.stop();
				});
			}
			detachParticipantTracks(room.localParticipant);
			room.participants.forEach(detachParticipantTracks);
			setState(Object.assign(state, { hasJoinedRoom: false, localMediaAvailable: false, activeRoom: undefined }));
		});
	}

	function onParticipantConnected(participant: Participant) {
		console.log("Joining: '" + participant.identity + "'");

		participant.on('trackSubscribed', track => {

			console.log('Track subscribed');
			console.log(track);
			let element = track.attach();
			element.id = track.sid;
			remoteMediaRef.current!.appendChild(element);
		});

		participant.on('trackUnsubscribed', track => {
			console.log('trackUnsubscribed');
			console.log(track);

			detachTrack(track);
		});

		participant.tracks.forEach((track) => {
			console.log(track);
			let remoteTrack = track as RemoteTrackPublication;

			if (remoteTrack.isSubscribed) {
				attachTrack(remoteTrack, remoteMediaRef.current!);
			}
		});
	}

	function getAxiosConfig() {
		//hack for localhost
		var config = { baseURL: '' }
		if (window.location.hostname === 'localhost') {
			config.baseURL = 'http://localhost:3000'
		}
		return config;
	}


	function leaveRoom() {
		if (state.activeRoom) {

			let room: Room = state.activeRoom;

			room.disconnect();
			if (room.participants.size === 0) {
				axios.post('/closeRoom', { "roomSid": room.sid }, getAxiosConfig()).then(results => {
					console.log(results);

					axios.post('/recording', { "roomSid": room.sid }, getAxiosConfig()).then((recordResult: any) => {
						console.log(recordResult);
						waitForRecording(recordResult.data.sid);
					});
				});

			}

		}
		setState(Object.assign(state, { hasJoinedRoom: false, localMediaAvailable: false }));
	}

	function waitForRecording(compositionId: string) {

		axios.get('/compositions?compositionId=' + compositionId, getAxiosConfig()).then(res => {
			if (res.data.status === 'completed') {
				axios.get('/download?compositionId=' + compositionId, getAxiosConfig()).then(download => {
					console.log(download);
					setState(Object.assign(state, { recording: true, downloadLink: download.data.redirect_to }));
				});
			} else {
				//TODO: add timeout and intervals
				waitForRecording(compositionId);
			}
		});
	}



	// Hide 'Join Room' button if user has already joined a room.
	let joinOrLeaveRoomButton = state.hasJoinedRoom ? (
		<Button onClick={leaveRoom}>Leave Meeting</Button>
	) : (
			<Button onClick={joinRoom}>Join Meeting</Button>
		);
	return (
		<div className="flex-container">
			<div className="flex-item">
				{!state.hasJoinedRoom && <TextField
					label="Meeting Id"
					value={state.roomName}
					onChange={handleRoomNameChange}
					margin="normal"
				/>}
				<br />
				{joinOrLeaveRoomButton}
			</div>
			<div className="main-video">
				<div className="flex-item" ref={remoteMediaRef} id="remote-media" />
			</div>
			<div className="participants-section">
				{state.localMediaAvailable && <div ref={localMediaRef} />}
			</div>

			{state.recording && <a href={state.downloadLink}>Download recording</a>}
		</div>
	);
}

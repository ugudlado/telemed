import React, { Component, createRef, ChangeEvent } from 'react';
import Video, {  Room, ConnectOptions, LocalTrack, Participant,
	 LocalVideoTrack, LocalAudioTrack, LocalVideoTrackPublication, LocalAudioTrackPublication
	} from 'twilio-video';
import axios from 'axios';


export interface Props {

}

export interface State {
    identity:string;
    roomName:string;
    roomNameErr:boolean;
    previewTracks?:LocalTrack[] | MediaStreamTrack[];
    localMediaAvailable:boolean;
    hasJoinedRoom:boolean;
    activeRoom?:Room;
    token:string;
}



export default class VideoComponent extends Component<Props, State> {
    localMediaRef = createRef<HTMLDivElement>()
    remoteMediaRef = createRef<HTMLDivElement>()
	constructor(props: Props) {
		super(props);
		this.state = {
			identity: '',
			roomName: '',
			roomNameErr: false, // Track error for room name TextField
			token:'',
			localMediaAvailable: false,
			hasJoinedRoom: false
		};
		this.joinRoom = this.joinRoom.bind(this);
		this.handleRoomNameChange = this.handleRoomNameChange.bind(this);
		this.roomJoined = this.roomJoined.bind(this);
		this.leaveRoom = this.leaveRoom.bind(this);
		this.detachTracks = this.detachTracks.bind(this);
		this.detachParticipantTracks = this.detachParticipantTracks.bind(this);
	}

	handleRoomNameChange(e:ChangeEvent<HTMLInputElement>) {
		let roomName = e.target.value;
		this.setState({ roomName });
	}

	joinRoom() {
		if (!this.state.roomName.trim()) {
			this.setState({ roomNameErr: true });
			return;
		}

		console.log("Joining room '" + this.state.roomName + "'...");
        const connectOptions:ConnectOptions =
         {
            name: this.state.roomName
		};

		if (this.state.previewTracks) {
			connectOptions.tracks = this.state.previewTracks;
		}

		// Join the Room with the token from the server and the
		// LocalParticipant's Tracks.
		Video.connect(this.state.token, connectOptions).then(this.roomJoined, error => {
			alert('Could not connect to Twilio: ' + error.message);
		});
	}

	//Unable to fix the type of track
	attachTrack(track: any,conatiner: Element) {
		let newTrack : LocalVideoTrackPublication | LocalAudioTrackPublication  = track;
		conatiner.appendChild(newTrack.track.attach());
	}

	detachTrack(track: any) {
		let newTrack : LocalVideoTrackPublication | LocalAudioTrackPublication = track;
		newTrack.track.detach().forEach((detachedElement : HTMLElement)=> {
			detachedElement.remove();
		})
	}


	// Attaches a track to a specified DOM container
	attachParticipantTracks(participant: Participant, container: React.RefObject<HTMLDivElement>) {
		participant.tracks.forEach(track =>  this.attachTrack(track, container.current!))
	}


	detachTracks(tracks: any[]) {
		tracks.forEach((track)=> {
			this.detachTrack(track);
		});
	}

	detachParticipantTracks(participant: Participant) {
		var tracks = Array.from(participant.tracks.values());
		this.detachTracks(tracks);
	}

	roomJoined(room: Video.Room) { 
		// Called when a participant joins a room
		console.log("Joined as '" + this.state.identity + "'");
		this.setState({
			activeRoom: room,
			localMediaAvailable: true,
			hasJoinedRoom: true
		});

        // Attach LocalParticipant's Tracks, if not already attached.
        
		if (!this.localMediaRef.current!.querySelector('video')) {
			this.attachParticipantTracks(room.localParticipant, this.localMediaRef);
		}

		// Attach the Tracks of the Room's Participants.
		room.participants.forEach((participant) => {
			console.log("Already in Room: '" + participant.identity + "'");
			var previewContainer = this.remoteMediaRef;
			this.attachParticipantTracks(participant, previewContainer);
		});

		// When a Participant joins the Room, log the event.
		room.on('participantConnected', (participant: { identity: string; }) => {
			console.log("Joining: '" + participant.identity + "'");
		});

		// When a Participant adds a Track, attach it to the DOM.
		room.on('trackAdded', (track: { kind: string; }, participant: { identity: string; }) => {
			console.log(participant.identity + ' added track: ' + track.kind);
			var previewContainer = this.remoteMediaRef.current!;
			this.attachTrack(track, previewContainer);
		});

		// When a Participant removes a Track, detach it from the DOM.
		room.on('trackRemoved', (track: { kind: string; }, participant: { identity: string; }) => {
			console.log(participant.identity + ' removed track: ' + track.kind);
			this.detachTracks([track]);
		});

		// When a Participant leaves the Room, detach its Tracks.
		
		room.on('participantDisconnected', (participant: Participant) => {
			console.log("Participant '" + participant.identity + "' left the room");
			this.detachParticipantTracks(participant);
		});

		// Once the LocalParticipant leaves the room, detach the Tracks
		// of all Participants, including that of the LocalParticipant.
		room.on('disconnected', () => {
			if (this.state.previewTracks) {
				this.state.previewTracks!.forEach((track:any) =>{ 
					let videoTrack : LocalVideoTrack | LocalAudioTrack = track;
					videoTrack.stop();
				});
			}
			this.detachParticipantTracks(room.localParticipant);
			room.participants.forEach(this.detachParticipantTracks);
			this.setState({ hasJoinedRoom: false, localMediaAvailable: false, activeRoom : undefined });
		});
	}

	componentDidMount() {
		axios.get('http://localhost:3001/token').then(results => {
			const { identity, token } = results.data;
			this.setState({ identity, token });
		});
	}

	leaveRoom() {
		this.state.activeRoom!.disconnect();
		this.setState({ hasJoinedRoom: false, localMediaAvailable: false });
	}

	render() {
		// Only show video track after user has joined a room
		let showLocalTrack = this.state.localMediaAvailable ? (
			<div className="flex-item">
				<div ref={this.localMediaRef} />
			</div>
		) : (
			''
		);
		// Hide 'Join Room' button if user has already joined a room.
		let joinOrLeaveRoomButton = this.state.hasJoinedRoom ? (
			<input type="button" value="Leave Room" onClick={this.leaveRoom} />
		) : (
			<input type="button" value="Join Room" onClick={this.joinRoom} />
		);
		return (
					<div className="flex-container">
						{showLocalTrack}
						<div className="flex-item">
							<input type="text"
								placeholder="room name"
								onChange={this.handleRoomNameChange}
							/>
							<br />
							{joinOrLeaveRoomButton}
						</div>
						<div className="flex-item" ref={this.remoteMediaRef} id="remote-media" />
					</div>
		);
	}
}
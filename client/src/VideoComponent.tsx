import React, { Component, createRef, ChangeEvent, createElement } from 'react';
import Video, {  Room, ConnectOptions, LocalTrack, Participant,
	 LocalVideoTrack, LocalAudioTrack, LocalVideoTrackPublication, LocalAudioTrackPublication, RemoteAudioTrackPublication, RemoteVideoTrackPublication, RemoteTrackPublication
	} from 'twilio-video';
import axios from 'axios';
import { ContentSelectAll } from 'material-ui/svg-icons';


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

type AudioVideoTrackPublication = LocalAudioTrackPublication | LocalVideoTrackPublication | RemoteAudioTrackPublication | RemoteVideoTrackPublication;


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
		this.onParticipantConnected = this.onParticipantConnected.bind(this);
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
		let newTrack:AudioVideoTrackPublication = track;
		if(newTrack.track) {
			conatiner.appendChild(newTrack.track.attach());
		}
	}

	detachTrack(track: any) {
		let newTrack : AudioVideoTrackPublication = track;
		
		newTrack.track && newTrack.track.detach().forEach((detachedElement : HTMLElement)=> {
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
		tracks.forEach(track=> {
			console.log(track.trackSid);
			let element = document.getElementById(track.trackSid);
			if(element) {
				element.remove();
			}
		});
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
		room.participants.forEach(this.onParticipantConnected);

		// When a Participant joins the Room, log the event.
		room.on('participantConnected', this.onParticipantConnected);

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

	onParticipantConnected(participant: Participant){
		console.log("Joining: '" + participant.identity + "'");

		participant.on('trackSubscribed', track=>{
			console.log('Track subscribed');
			console.log(track);
			let element = track.attach();
			element.id =  track.sid;
			this.remoteMediaRef.current!.appendChild(element);	
		});

		participant.on('trackUnsubscribed', track=>{
			console.log('trackUnsubscribed');
			console.log(track);
			
			this.detachTrack(track);
		});

		participant.tracks.forEach((track)=>{
			console.log(track);
				let remoteTrack =  track as RemoteTrackPublication;
				
				if(remoteTrack.isSubscribed) {
					this.attachTrack(remoteTrack, this.remoteMediaRef.current!);
				}
		});	
	}

	componentDidMount() {
		let config = {
			baseURL : 'http://localhost:3000'
		}
		axios.get('/token', config).then(results => {
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
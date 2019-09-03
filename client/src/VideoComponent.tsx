import React, { Component, createRef, ChangeEvent } from 'react';
import Video, {  Room, ConnectOptions, LocalTrack, Participant,
	 LocalVideoTrack, LocalAudioTrack, LocalVideoTrackPublication,
	  LocalAudioTrackPublication, RemoteAudioTrackPublication, 
	  RemoteVideoTrackPublication, RemoteTrackPublication
	} from 'twilio-video';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';


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
	recording:boolean;
	token:string;
	downloadLink:string;
}

type AudioVideoTrackPublication = LocalAudioTrackPublication | LocalVideoTrackPublication | RemoteAudioTrackPublication | RemoteVideoTrackPublication;


export default class VideoComponent extends Component<Props, State> {
    localMediaRef = createRef<HTMLDivElement>();
	remoteMediaRef = createRef<HTMLDivElement>();
	constructor(props: Props) {
		super(props);
		this.state = {
			identity: '',
			roomName: 'Default',
			roomNameErr: false, // Track error for room name TextField
			token:'',
			localMediaAvailable: false,
			hasJoinedRoom: false,
			recording:false,
			downloadLink:''
		};
		this.joinRoom = this.joinRoom.bind(this);
		this.handleRoomNameChange = this.handleRoomNameChange.bind(this);
		this.roomJoined = this.roomJoined.bind(this);
		this.leaveRoom = this.leaveRoom.bind(this);
		this.detachTracks = this.detachTracks.bind(this);
		this.detachParticipantTracks = this.detachParticipantTracks.bind(this);
		this.onParticipantConnected = this.onParticipantConnected.bind(this);
		this.connect = this.connect.bind(this);
		this.getAxiosConfig = this.getAxiosConfig.bind(this);
		this.waitForRecording = this.waitForRecording.bind(this);
	}

	handleRoomNameChange(e:ChangeEvent<HTMLInputElement>) {
		let roomName = e.target.value;
		this.setState({ roomName });
	}

	connect() {
		console.log("Joining room '" + this.state.roomName + "'...");
			const connectOptions:ConnectOptions =
			{
				name: this.state.roomName,
				video: { width : 1000 },
				audio: true
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

	joinRoom() {
		if (!this.state.roomName.trim()) {
			this.setState({ roomNameErr: true });
			return;
		}
		let self = this;

		axios.post('/createRoom',{"uniqueName":this.state.roomName}, this.getAxiosConfig()).then((response)=>{
			self.connect();
		}).catch((error)=>{
			//room already exist
			if(error && error.code === 53113) {
				self.connect();
			} else {
				console.log(error);
			}
		});
		
	}

	//Unable to fix the type of track
	attachTrack(track: any,conatiner: Element) {
		console.log('Attach tracks');
		console.log(track);
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

	getAxiosConfig() {
		//hack for localhost
		var config = {baseURL:''}
		if(window.location.hostname === 'localhost') {
			config.baseURL = 'http://localhost:3000'
		} 
		return config;
	}

	componentDidMount() {
		
		axios.get('/token', this.getAxiosConfig()).then(results => {
			const { identity, token } = results.data;
			this.setState({ identity, token });
		});
	}

	leaveRoom() {
		if(this.state.activeRoom) {

			let room : Room  = this.state.activeRoom;
			let self = this;
			room.disconnect();
			if(room.participants.size === 0) {
				axios.post('/closeRoom', {"roomSid": room.sid } ,this.getAxiosConfig()).then(results=>{
					console.log(results);

					axios.post('/recording',{"roomSid": room.sid},this.getAxiosConfig()).then((recordResult:any)=>{
						console.log(recordResult);
						this.waitForRecording(recordResult.data.sid);
					});
				});
				
			}
	
		}
		this.setState({ hasJoinedRoom: false, localMediaAvailable: false });
	}

	waitForRecording(compositionId: string){
		let self = this;
		axios.get('/compositions?compositionId=' + compositionId, this.getAxiosConfig()).then(res=>{
				if(res.data.status === 'completed') {
				axios.get('/download?compositionId=' + compositionId, this.getAxiosConfig()).then(download=>{
					console.log(download);
					self.setState({recording:true, downloadLink : download.data.redirect_to});
				});
			} else {
				//TODO: add timeout and intervals
				this.waitForRecording(compositionId);
			}
		});
	}


	render() {
		
		// Hide 'Join Room' button if user has already joined a room.
		let joinOrLeaveRoomButton = this.state.hasJoinedRoom ? (
			<Button onClick={this.leaveRoom}>Leave Meeting</Button>
		) : (
			<Button onClick={this.joinRoom}>Join Meeting</Button>
		);
		return (
					<div className="flex-container">
						<div className="flex-item">
						{!this.state.hasJoinedRoom && <TextField
								label="Meeting Id"
								value={this.state.roomName}
								onChange={this.handleRoomNameChange}
								margin="normal"
							/>}
							<br />
							{joinOrLeaveRoomButton}
						</div>
						<div className="main-video">
							<div className="flex-item" ref={this.remoteMediaRef} id="remote-media" />
						</div>
						<div className="participants-section">
						{ this.state.localMediaAvailable && <div ref={this.localMediaRef} />}
						</div>

						{this.state.recording && <a href={this.state.downloadLink}>Download recording</a>}
					</div>
		);
	}
}
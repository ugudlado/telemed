import dotenv from "dotenv";
import * as express from "express";
import faker from "faker";
import twilio from "twilio";

class TwilioController {

    private AccessToken = twilio.jwt.AccessToken;
    private VideoGrant = this.AccessToken.VideoGrant;
    private result = dotenv.config();
    private client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCOUNT_AUTH_TOKEN);

    public getToken = (request: express.Request, response: express.Response) => {
        const identity = faker.name.findName();
        const token = this.generateToken(identity);

        // Serialize the token to a JWT string and include it in a JSON response
        response.send({
            identity,
            token: token.toJwt()
        });
    }

    public createRoom = (request: express.Request, response: express.Response) => {
        this.client.video.rooms.create(
            {
                recordParticipantsOnConnect: true,
                uniqueName: request.body.uniqueName
            }, (error, roomInstance) => {
                if (error) {
                    response.status(200).send(error);
                } else {
                    response.send(roomInstance);
                }
            });
    }

    public closeRoom = (request: express.Request, response: express.Response) => {
        this.client.video.rooms(request.body.roomSid)
            .update({ status: "completed" })
            .then((room) => response.send(room))
            .catch((error) => response.send(error));
    }

    public sendComposition = (request: express.Request, response: express.Response) => {
        this.client.video.compositions.
            create({
                audioSources: ["*"],
                format: "mp4",
                roomSid: request.body.roomSid,
                videoLayout: JSON.stringify({
                    grid: {
                        video_sources: ["*"]
                    }
                })
            })
            .then((composition) => {
                response.send(composition);
            }).catch((error) => response.send(error));
    }

    public getCompositionById = (request: express.Request, response: express.Response) => {
        const uri = "https://video.twilio.com/v1/Compositions/" + request.query.compositionId;
        this.client.request({
            method: "GET",
            uri
        })
            .then((res) => {
                response.send(res.body);
            })
            .catch((error) => {
                response.send(error);
            });
    }

    public downloadComposition = (request: express.Request, response: express.Response) => {
        const uri = "https://video.twilio.com/v1/Compositions/" + request.query.compositionId + "/Media?Ttl=3600";

        this.client.request({
            method: "GET",
            uri
        })
            .then((res) => {
                const mediaLocation = JSON.parse(res.body).redirect_to;
                response.send(res.body);
            })
            .catch((error) => {
                response.send(error);
            });
    }

    private generateToken = (user: string) => {
        // Create an access token which we will sign and return to the this.client,
        // containing the grant we just created
        const token = new twilio.jwt.AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_API_KEY,
            process.env.TWILIO_API_SECRET, { identity: user }
        );

        const grant = new this.VideoGrant();
        // Grant token access to the Video API features
        token.addGrant(grant);
        return token;
    }

}

export default TwilioController;

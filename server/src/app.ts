import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import faker from "faker";
import twilio from "twilio";

const result = dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCOUNT_AUTH_TOKEN);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const getToken = (user: string) => {
    const identity = user;

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    const token = new twilio.jwt.AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET
    );

    // Assign the generated identity to the token
    // token.identity = identity;

    const grant = new VideoGrant();
    // Grant token access to the Video API features
    token.addGrant(grant);
    return token;
};

app.get("/token", (request, response) => {
    const identity = faker.name.findName();
    const token = getToken(identity);

    // Serialize the token to a JWT string and include it in a JSON response
    response.send({
        identity,
        token: token.toJwt()
    });
 });

app.post("/createRoom", (req, res) => {
    client.video.rooms.create(
        {
            recordParticipantsOnConnect: true,
            uniqueName: req.body.uniqueName
        }, (error, roomInstance) => {
            if (error) {
                res.status(200).send(error);
            } else {
                res.send(roomInstance);
            }
        });
 });

app.post("/closeRoom", (req, res) => {
    client.video.rooms(req.body.roomSid)
            .update({status: "completed"})
            .then((room) => res.send(room))
            .catch((error) => res.send(error));
 });

app.post("/recording", (request, response) => {
    client.video.compositions.
        create({
            audioSources: ["*"],
            format: "mp4",
            roomSid: request.body.roomSid,
            videoLayout: JSON.stringify({
                grid : {
                    video_sources: ["*"]
                }
            })
        })
        .then((composition) => {
            response.send(composition);
        }).catch((error) => response.send(error));
 });

app.get("/compositions", (req, res) => {
    const uri = "https://video.twilio.com/v1/Compositions/" + req.query.compositionId;
    client.request({
        method: "GET",
        uri
      })
      .then((response) => {
        res.send(response.body);
      })
      .catch((error) => {
        res.send(error);
      });
 });

app.get("/download", (req, resp) => {
    const uri = "https://video.twilio.com/v1/Compositions/" + req.query.compositionId + "/Media?Ttl=3600";

    client.request({
        method: "GET",
        uri
      })
      .then((response) => {
        const mediaLocation = JSON.parse(response.body).redirect_to;
        resp.send(response.body);
      })
      .catch((error) => {
        resp.send(error);
      });
 });

app.post("callback", (req, resp) => {
     resp.status(200).send();
 });

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

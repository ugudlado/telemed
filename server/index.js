const express = require('express')

const bodyParser = require('body-parser')
const faker = require('faker')
const result = require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000

var AccessToken = require('twilio').jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCOUNT_AUTH_TOKEN);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'))

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var getToken = (user)=>{
    var identity = user;

    console.log(process.env);
 
    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    var token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET
    );

 
    // Assign the generated identity to the token
    token.identity = identity;
 
    const grant = new VideoGrant();
    // Grant token access to the Video API features
    token.addGrant(grant);
    return token;
};

app.get('/token', function(request, response) {
    var identity = faker.name.findName();
    var token = getToken(identity);
 
    // Serialize the token to a JWT string and include it in a JSON response
    response.send({
        identity: identity,
        token: token.toJwt()
    });
 });

 app.post('/createRoom',function(req,res){
    client.video.rooms.create(
        {
            'uniqueName': req.body.uniqueName,
            'recordParticipantsOnConnect': 'true'
        }, (error, roomInstance)=>{
            if(error){
                res.status(200).send(error);
            } else {
                res.send(roomInstance);
            }
        });
 });

 app.post('/closeRoom',function(req,res){
    client.video.rooms(req.body.roomSid)
            .update({status: 'completed'})
            .then(room => res.send(room))
            .catch(error=> res.send(error));
 });

 app.post('/recording',(request, response)=>{
    client.video.compositions.
        create({
            roomSid: request.body.roomSid,
            audioSources: '*',
            videoLayout: {
                grid : {
                    video_sources: ['*']
                }
            },
            format: 'mp4'
        })
        .then(composition =>{
            response.send(composition);
            console.log('Created Composition with SID=' + composition.sid);
        }).catch(error=> response.send(error));
 });

 app.get('/compositions',(req,res)=>{
    const uri ='https://video.twilio.com/v1/Compositions/' + req.query.compositionId;
    client.request({
        method: 'GET',
        uri: uri
      })
      .then(response =>{
        res.send(response.body);
      })
      .catch(error =>{
        console.log("Error fetching /Media resource " + error);
        res.send(error);
      });
 });

 app.get('/download',(req,resp)=>{
    const uri ='https://video.twilio.com/v1/Compositions/' + req.query.compositionId + '/Media?Ttl=3600';

    client.request({
        method: 'GET',
        uri: uri
      })
      .then(response =>{
        const mediaLocation = JSON.parse(response.body).redirect_to;
        resp.send(response.body);
      })
      .catch(error =>{
        console.log("Error fetching /Media resource " + error);
        resp.send(error);
      });
 });

 app.post('callback',(req,resp)=>{
     console.log(req);
    response.status(200).send();
 });

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
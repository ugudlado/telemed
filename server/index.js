const express = require('express')
const faker = require('faker')
const result = require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000

var AccessToken = require('twilio').jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;

console.log(result)

app.use(express.static('public'))

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/token', function(request, response) {
    var identity = faker.name.findName();

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
 
    // Serialize the token to a JWT string and include it in a JSON response
    response.send({
        identity: identity,
        token: token.toJwt()
    });
 });

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
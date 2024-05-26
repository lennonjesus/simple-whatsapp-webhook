// Import the necessary libraries
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

// Create an Express app
const app = express();

// Use the body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Define the port to listen on
const port = 3000;

app.get("/", (req, res, next) => {
  res.sendStatus(200);
});

app.get("/webhook", (req, res, next) => {

  if (
    req.query['hub.mode'] == 'subscribe' &&
    req.query['hub.verify_token'] == 'deubom'
  ) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }

});

// Define the webhook endpoint
app.post('/webhook', (req, res) => {
  // Get the JSON payload from the request body
  const payload = JSON.parse(JSON.stringify(req.body));

  // Check if the payload is valid
  if (!payload || !payload.entry) {
    res.status(400).send('Invalid payload');
    return;
  }

  // Loop through the entries in the payload
  payload.entry.forEach((entry) => {
    // Get the messaging array from the entry
    const messaging = entry.messaging;

    // Loop through the messages in the messaging array
    messaging.forEach((message) => {
      // Get the sender ID from the message
      const senderId = message.sender.id;

      // Get the message text from the message
      const messageText = message.message.text;

      // Send a response message to the sender
      const responseMessage = {
        text: 'Hello, world!'
      };

      request({
        url: 'https://graph.facebook.com/v12.0/me/messages',
        qs: {
          access_token: process.env.FACEBOOK_ACCESS_TOKEN
        },
        method: 'POST',
        json: {
          messaging_product: 'whatsapp',
          to: senderId,
          message: responseMessage
        }
      }, (err, res, body) => {
        if (err) {
          console.error('Error sending message:', err);
          return;
        }

        console.log('Message sent:', body);
      });
    });
  });

  // Send a success response to the webhook endpoint
  res.status(200).send('Success');
});

// Start the Express app
app.listen(port, () => {
  console.log(`Webhook listening on port ${port}`);
});
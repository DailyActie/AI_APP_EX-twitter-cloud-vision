const express = require('express');
const app = express();
const server = require('http').Server(app);
// Socket io
const io = require('socket.io')(server);
// Node twitter module
const Twitter = require('twitter');
// Twitter developer credentials
const settings = require('./settings.js');
// Date time manipulation
const moment = require('moment');
// Colored console
const chalk = require('chalk');

server.listen(3000);

// Remove moment warnings
moment.suppressDeprecationWarnings = true;

// Initialize Twitter Module
const client = new Twitter(settings.keys);

// Streaming API
const stream = client.stream('statuses/filter', {
	tweet_mode: 'extended',
	track: 'SELFIE'
});

app.use(express.static('public')); 
app.use('/lib', express.static(__dirname + '/node_modules')); 

app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/public/index.html`);
});

io.on('connection', (socket) => {
	console.log('connected')
	// GET Real-Time Tweets
	stream.on('data', (event) => {
		// emit data
		if (event.entities.hasOwnProperty('media') && !event.possibly_sensitive) {
			socket.emit('tweet', event);
			// Log to console
			const created_at = moment(event.created_at).format('MMMM D YYYY, h:mm:ss a');
			console.log(created_at);
			console.log(chalk.yellow(`${event.user.name}: ${event.text}`));
		}
	});

	stream.on('error', (err) => {
		throw err;
	})
})
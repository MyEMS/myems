const compression = require('compression');
const express = require('express');
const path = require('path');
const app = express();
app.use(compression());
app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'build')));

// set up rate limiter: maximum of five requests per minute
var RateLimit = require('express-rate-limit');
var limiter = new RateLimit({
  windowMs: 1*60*1000, // 1 minute
  max: 5 // limit each IP to 5 requests per windowMs
});
// apply rate limiter to all requests
app.use(limiter);

// need to declare a "catch all" route on your express server
// that captures all page requests and directs them to the client
// the react-router do the route part
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.listen(process.env.PORT || 80, function() {
  console.log(`Frontend start on http://localhost:80`);
});

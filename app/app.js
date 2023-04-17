const express = require('express');
var session = require('express-session');
const hbs = require('hbs');
const path = require('path');
const config = require('../config/index');
const app = express();
const bodyparser = require('body-parser');
const PORT = config.server.port || 3000;

const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)

//Setup middleware
hbs.registerPartials(__dirname + '/views/partials') // partials view
app.set('view engine', 'hbs'); // engine view

io.on('connection', (socket) => {
  console.log('connected', socket.id);
  app.set('socketIO', io);
})

app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(bodyparser.json());

app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
  secret: 'abcdefg',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 600000 }
}));

hbs.registerHelper('getCurrentYear', () => { //ViewHelper
  return new Date().getFullYear();
});

hbs.registerHelper('screamIt', (text) => { //ViewHelper
  return text.toUpperCase();
});

require('../lib/database');  // connect DB

server.listen(PORT, () => {
  // app._router.stack.forEach(function(r){
  //   if (r.route && r.route.path && r.route.stack.method){
  //     console.log(r.route.stack.method + "    " + r.route.path)
  //   }
  // })
  console.log(`running app port ${PORT}`)
});

require('../routes/root')(app);

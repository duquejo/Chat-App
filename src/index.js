/**
 * 
 * 
 * Main index.js Chat App 
 * Server configuration file
 * 
 * @requires express
 * @requires path
 * @requires http
 * @requires socket.io
 * @requires bad-words
 * @requires messages.js Message Utils
 * @requires users.js Users Utils
 */
const express  = require('express');
const http     = require('http');
const path     = require('path');
const socketio = require('socket.io');
const Filter   = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

/**
 * Define Express App
 */
const app = express();
const server = http.createServer(app);
const io = socketio(server); // socketio depends of passing the raw server

/**
 * App port
 */
const port = process.env.PORT || 3000;

/**
 * Define paths for Express config
 */
const publicDirectoryPath = path.join( __dirname, '../public' );
app.use( express.static( publicDirectoryPath ));

/**
 * Socket IO Connection (IN)
 * 
 * @param socket has info about new connections
 * 
 * server (emit) -> client (receive) - 'countUpdated'
 * client (emit) -> server (receive) - 'increment'
 * 
 */
io.on('connection', socket => { 

  console.log('New WebSocket connection');

  /**
   * Server client join event listener
   */
  socket.on('join', ( options, callback ) => {
    
    /**
     * Adds user to array structure
     * @see socket.id Is a easy way to get a user based in socket conn
     */
    const { error, user } = addUser( { id: socket.id, ...options } );

    if( error ) return callback( error );

    /**
     * Socket IO Room Join
     */
    socket.join( user.room );

    /**
     * When we use rooms we have new methods for handle that
     * 
     * io.to(room).emit : Emits a event to everyone in the room
     * socket.broadcast.to(room).emit : Sends an event to everyone except for the specific client limited at the specific room
     * 
     */

    /**
     * Send an event to a particular connection 1:1
     * @param event string
     * @param callback mixed
     */  
    socket.emit('message', generateMessage( 'Chat App', `Welcome ${user.username} to Chat App!` ) );

    /**
     * Emits to everybody except the current user
     * 1:all except self
     */
    socket.broadcast.to(user.room).emit('message', generateMessage( 'Chat App', `${ user.username } has joined!` ) );

    /**
     * Join to room users list
     */
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom( user.room )
    });

    /**
     * Callback response process
     */
    callback();
  });

  /**
   * Server sendMessage
   */
  socket.on('sendMessage', ( message, callback ) => {

    /**
     * Checking and filtering bad words
     */
    const filter = new Filter();
    if( filter.isProfane( message ) ) return callback('Profanity is not allowed!');

    /**
     * Get user by id
     */
    const user = getUser( socket.id );
    if( ! user ) return callback( { error: 'User doesn\'t exist' });

    /**
     * We need to emit that like a broadcasted client event (All clients)
     * all:all
     * 
     * socket.emit: emits to a specific connection
     * io.emit: emits to a whole server clients connected
     */    
    io.to(user.room).emit('message', generateMessage( user.username, message ));

    /**
     * Callback
     * @see Nothing if success
     */
    callback();
  });

  /**
   * Server sendLocation
   * Works with Google Maps
   */
  socket.on('sendLocation', ( position, callback ) => {

    /**
     * Get user by id
     */
     const user = getUser( socket.id );
     if( ! user ) return callback( { error: 'User doesn\'t exist' });

    /**
     * Broadcast emitting message
     */
    io.to(user.room).emit('locationMessage', generateLocationMessage( user.username, position ));

    /**
     * Acknowledge Callback
     */
    callback('Location Shared!');
  });

  /**
   * Disconnect listener
   * 
   */
  socket.on('disconnect', () => {

    /**
     * Remove user by id
     */
    const user = removeUser( socket.id );

    /**
     * @bugfix Only disconnect a user that has joined in any chat before 
     */
    if( user ) {

      io.to( user.room ).emit('message', generateMessage( 'Chat App', `${ user.username } has left!`));

      /**
       * Remove user from room
       */
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom( user.room )
      });
    }
  });

});

 /**
 * Listening function
 * Is important to define a new server, so, I required NodeJS http module 
 * and define manually the server calling http.createServer(app)
 */
server.listen( port, () => console.log( `Server is up on port ${ port }`) );
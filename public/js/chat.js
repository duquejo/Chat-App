/**
 * Chat file will connect users with the server through socket io client
 * @requires socket.io
 */
const socket = io(); // Enables connection

/**
 * Receive server events
 */
const $messages = document.querySelector('#messages');

/**
 * Templates
 */
const messageTemplate         = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate         = document.querySelector('#sidebar-template').innerHTML;

/**
 * 
 * Autoscroll function
 * Gets the last message in screen, calculates height
 */
const autoScroll = () => {

  const $newMessage = $messages.lastElementChild;

  /**
   * Calculate height
   */
  const newMessageStyles = getComputedStyle( $newMessage );
  const newMessageMargin = parseInt( newMessageStyles.marginBottom );
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  /**
   * Visible Height
   */
  const visibleHeight = $messages.offsetHeight;

  /**
   * Height of messages container
   */
  const containerHeight = $messages.scrollHeight;

  /**
   * How far have I scrolled? 
   */
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if( ( containerHeight - newMessageHeight ) <= scrollOffset ){
    $messages.scrollTop = $messages.scrollHeight;
  }
};

/**
 * Query String (QS Library ) Options
 */
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on('message', message => {
  // console.log( message );
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html );

  // Auto Scroll to bottom
  autoScroll();
});

/**
 * Location Message
 */
socket.on('locationMessage', message => {
  // console.log( message );
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a') 
  });
  $messages.insertAdjacentHTML('beforeend', html );

  // Auto Scroll to bottom
  autoScroll();  
});

/**
 * Users List
 */
socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  document.querySelector('#sidebar').innerHTML = html;
});

/**
 * Submit button handler
 */
const $messageForm = document.querySelector('#chat-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationFormButton = document.querySelector('#send-location');

$messageForm.addEventListener('submit', event => {

  event.preventDefault();

  /**
   * Disable form during emmiting
   */
  $messageFormInput.setAttribute( 'disabled', 'disabled' );

  const message = event.target.elements.message.value;

  /**
   * Emitting from client to server
   * @param event
   * @param value
   * @param acknowledge callback
   */  
  socket.emit('sendMessage', message, ( error ) => {
    
    /**
     * Enable form
     */
     $messageFormInput.removeAttribute( 'disabled' );
     $messageFormInput.value = '';
     $messageFormInput.focus();

    if( error ) {
      return console.error( error );
    }
    // console.log('Message delivered!');
  });
});

/**
 * Get location handler
 * Uses native browser geolocation
 */
document.querySelector('#send-location').addEventListener('click', () => {
  
  if ( ! navigator.geolocation ) return alert('Geolocation is not supported by your browser'); 

  /**
   * Disable button before request
   */
  $locationFormButton.setAttribute( 'disabled', 'disabled' );

  navigator.geolocation.getCurrentPosition( position => {

    /**
     * sendLocation server emitting
     * @param position
     * @param callback from Server
     */
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, ( message ) => {

      /**
       * Enable button
       */
      $locationFormButton.removeAttribute( 'disabled' );
      // console.log( message );
    } );
  });
});

/**
 * Join client emit method
 * @param event
 * @param user data
 * @param callback
 */
socket.emit('join', { username, room }, error => {
  if( error ) {
    alert( error );
    location.href = '/';
  }
});
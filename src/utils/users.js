/**
 * 
 * Keep track of the users in the Chat
 * 
 */
const users = [];

/**
 * 
 * Add users
 * @param id
 * @param username
 * @param room
 */
const addUser = ( { id, username, room } ) => {

  /**
   * Sanitize values
   */
  username = username.trim().toLowerCase();
  room     = room.trim().toLowerCase();

  /**
   * Validate values
   */
  if( ! username || ! room ) return { error: 'Username and room are required' };

  /**
   * Check for existing user
   */
  const existingUser = users.find( user => {
    return user.room === room && user.username === username
  });

  /**
   * Validate User
   */
  if ( existingUser ) return { error: 'Username is in use' };

  /**
   * Store User
   */
  const user = { id, username, room };
  users.push( user );
  return { user };
};

/**
 * Remove users by Index
 * @param Number id 
 */
const removeUser = id => {
  const index = users.findIndex( user => user.id === id );
  // Remove from array and return it.
  if( index !== -1 ) return users.splice( index, 1 )[0]; 
};

/**
 * Get user by id
 * @param id
 */
const getUser = id => {
  return users.find( user => user.id === id );
}

/**
 * Get users in room
 * @param room
 */
const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  return users.filter( user => user.room == room );
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
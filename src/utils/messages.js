/**
 * Messages utils methods
 * 
 * @method generateMessage Adds time to the message
 */

const generateMessage = ( username, text ) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  }
};

const generateLocationMessage = ( username, { latitude = 0, longitude = 0 } ) => {
  return {
    username,
    url: `https://www.google.com/maps?q=${ latitude },${ longitude }`,
    createdAt: new Date().getTime()
  }
};

module.exports = {
  generateMessage,
  generateLocationMessage
};
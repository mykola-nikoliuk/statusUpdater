const Sntp = require('sntp');
const options = {host: 'time.google.com'};

async function getTime() {
  try {
    return (await Sntp.time(options)).originateTimestamp;
  }
  catch (err) {
    return null;
  }
}

module.exports = getTime;

const fs = require('fs');

const firebase = require('./firebase');
const getTime = require('./time');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const {
  firebaseConfig,
  updatePeriod,
  serverName,
  firebaseCredentials: {email, password}
} = config;

function subscribe() {
  firebase.path('servers').on('value', snapshot => {
    console.log(snapshot.val());
  });
}

function updateTime() {
  getTime().then(time => {
    firebase.path('servers').update({
      [serverName]: time
    });
  });
}

firebase
  .auth(email, password, firebaseConfig)
  // .then(subscribe)
  .then(() => setInterval(updateTime, updatePeriod));

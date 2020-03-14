const fs = require('fs');
const tcpp = require('tcp-ping');
const format = require('date-format');

const firebase = require('./firebase');
const getTime = require('./time');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const {
  firebaseConfig,
  updatePeriod = 5000,
  updatePingPeriod = 15000,
  serverName,
  firebaseCredentials: { email, password }
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

function updatePing() {
  const time = Date.now();

  tcpp.ping({ address: 'google.com', attempts: 3 }, function (err, { avg }) {
    const date = format.asString('yyyy-MM-dd', new Date(time));

    console.log('date', date);

    firebase.path(`ping/${serverName}/${date}`).update({
      [time]: avg | 0
    });
  });
}

firebase
  .auth(email, password, firebaseConfig)
  // .then(subscribe)
  .then(() => setInterval(updateTime, updatePeriod))
  .then(() => setInterval(updatePing, updatePingPeriod))
  .then(() => updateTime())
  .then(() => updatePing());

const firebase = require('firebase');

function loginFirebaseUser(email, password, config) {
  console.log('Logging in Firebase User');

  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }

  return firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .catch(function (login_error) {
      let loginErrorCode = login_error.code;
      let loginErrorMessage = login_error.message;

      console.log(loginErrorCode);
      console.log(loginErrorMessage);

      if (loginErrorCode === 'auth/user-not-found') {
        return createFirebaseUser(email, password)
      }
    });
}

function createFirebaseUser(email, password) {
  console.log('Creating Firebase User');

  return firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .catch(function (create_error) {
      let createErrorCode = create_error.code;
      let createErrorMessage = create_error.message;

      console.log(createErrorCode);
      console.log(createErrorMessage);
    });
}

class Firebase {
  static auth(email, password, config) {
    return loginFirebaseUser(email, password, config);
  }

  static path(path) {
    return firebase.database().ref(`/users/${firebase.auth().currentUser.uid}/${path}`);
  }
}

module.exports = Firebase;



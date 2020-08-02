importScripts('js/firebase/firebase-app.js');
importScripts('js/firebase/firebase-messaging.js');
importScripts("js/firebase/InitFirebase.js");

// Initialize Firebase

const messaging = firebase.messaging();



/*messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});*/
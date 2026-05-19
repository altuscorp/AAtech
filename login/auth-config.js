/* Firebase config + app init (compat SDK).
 * Loaded by index.html, form.html, and dashboard.html via a plain <script>
 * tag AFTER firebase-app-compat.js / firebase-auth-compat.js. */

(function () {
  var firebaseConfig = {
    apiKey: "AIzaSyAeWX4SKK7MS3LVU0KxjyE4WApHHHkaMYI",
    authDomain: "aa-tech-login.firebaseapp.com",
    projectId: "aa-tech-login",
    storageBucket: "aa-tech-login.firebasestorage.app",
    messagingSenderId: "884235934365",
    appId: "1:884235934365:web:cd808a5c055cbfe1c71274",
    measurementId: "G-10CJV5DZHF"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Analytics is optional — only enabled if firebase-analytics-compat.js is also loaded.
  if (typeof firebase.analytics === 'function') {
    try { firebase.analytics(); } catch (e) { /* analytics unavailable — ignore */ }
  }
})();

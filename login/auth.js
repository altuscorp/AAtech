/* window.Auth — Firebase compat-SDK helpers consumed by index.html
 * (login form), form.html, and dashboard.html (auth-guarded pages). */

(function () {
  var auth = firebase.auth();

  function signIn(email, password, keepSignedIn) {
    var persistence = keepSignedIn
      ? firebase.auth.Auth.Persistence.LOCAL    // survives browser restart
      : firebase.auth.Auth.Persistence.SESSION; // cleared when tab closes
    return auth.setPersistence(persistence).then(function () {
      return auth.signInWithEmailAndPassword(email, password);
    });
  }

  function signOut() {
    return auth.signOut();
  }

  /* Protect a page. The page must include
   *   <style id="auth-guard-hide">html { visibility: hidden; }</style>
   * as the first thing in <head>; we remove it once a user is confirmed,
   * or redirect to the login page if none. */
  function guardPage(options) {
    var redirectTo = (options && options.redirectTo) || 'index.html';
    auth.onAuthStateChanged(function (user) {
      if (!user) {
        window.location.replace(redirectTo);
        return;
      }
      var guard = document.getElementById('auth-guard-hide');
      if (guard && guard.parentNode) guard.parentNode.removeChild(guard);
    });
  }

  // For the login page — bounce already-authenticated users straight to the app.
  function redirectIfSignedIn(target) {
    auth.onAuthStateChanged(function (user) {
      if (user) window.location.replace(target);
    });
  }

  function friendlyError(err) {
    var code = err && err.code ? err.code : '';
    switch (code) {
      case 'auth/invalid-email':
        return 'That email address is not valid.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Contact your administrator.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        return 'Incorrect email or password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again in a few minutes.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      default:
        return (err && err.message) || 'Sign-in failed. Please try again.';
    }
  }

  window.Auth = {
    signIn: signIn,
    signOut: signOut,
    guardPage: guardPage,
    redirectIfSignedIn: redirectIfSignedIn,
    friendlyError: friendlyError
  };
})();

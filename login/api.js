/* login/api.js — bridge for calling backend functions.
 *
 *   callApi('getFormData')              -> Promise<result>
 *   callApi('submitForm', payload)      -> Promise<result>
 *   callApi('addNavButton', payload)    -> Promise<result>
 *   callApi('getDashboardData')         -> Promise<result>
 *   callApi('getNavButtons')            -> Promise<result>
 *
 * Three modes, picked in order:
 *   1. Hosted inside Apps Script (google.script.run is present).
 *   2. Static + Apps Script web-app  (AS_URL is set → fetch).
 *   3. Pure local (no backend)       — reads dropdown data from window.LOCAL_DATA
 *                                      (login/data.js) and stores submissions /
 *                                      nav buttons in localStorage.
 */

window.AS_URL = 'https://script.google.com/macros/s/AKfycbz2RlqMejOjf_zPjjuGqwlUseaBBS2o7EWlqF1zdSn29aat3eRAt-MiWOknUpcGR1jt/exec'; // paste your Apps Script /exec URL here to switch to backend mode

(function () {
  var LS_RESPONSES  = 'aatech.responses';
  var LS_NAVBUTTONS = 'aatech.navButtons';

  function lsGet(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (_) { return fallback; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
  }

  function sortedEmployees() {
    var src = (window.LOCAL_DATA && window.LOCAL_DATA.employees) || [];
    if (!src.length) return { list: [], pinned: '' };
    var pinned = src[0];
    var rest = src.slice(1).sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    return { list: [pinned].concat(rest.filter(function (n) { return n.toLowerCase() !== pinned.toLowerCase(); })), pinned: pinned };
  }

  function sortedSubjects() {
    var src = (window.LOCAL_DATA && window.LOCAL_DATA.subjects) || [];
    return src.slice().sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
  }

  function localHandle(action, payload) {
    var emp = sortedEmployees();
    var navButtons = lsGet(LS_NAVBUTTONS, []);

    switch (action) {
      case 'getFormData':
        return {
          employees: emp.list,
          pinned: emp.pinned,
          subjects: sortedSubjects(),
          navButtons: navButtons
        };

      case 'getNavButtons':
        return navButtons;

      case 'addNavButton': {
        var name = String((payload && payload.name) || '').trim();
        var link = String((payload && payload.link) || '').trim();
        if (!name || !link) throw new Error('Both name and link are required.');
        navButtons.push({ name: name, link: link });
        lsSet(LS_NAVBUTTONS, navButtons);
        return navButtons;
      }

      case 'submitForm': {
        var responses = lsGet(LS_RESPONSES, []);
        // Normalize to the field names dashboard.html renders (doer, initiator, client, status).
        responses.push({
          timestamp: new Date().toISOString(),
          subject:   (payload && payload.subject)       || '',
          client:    (payload && payload.clientName)    || '',
          initiator: (payload && payload.taskInitiator) || '',
          doer:      (payload && payload.taskDoer)      || '',
          task:      (payload && payload.task)          || '',
          priority:  (payload && payload.priority)      || '',
          dueDate:   (payload && payload.dueDate)       || '',
          notes:     (payload && payload.notes)         || '',
          status:    'Not Started'
        });
        lsSet(LS_RESPONSES, responses);
        return { ok: true, count: responses.length };
      }

      case 'getDashboardData': {
        var seed = (window.LOCAL_DATA && window.LOCAL_DATA.seedRows) || [];
        return {
          rows: seed.concat(lsGet(LS_RESPONSES, [])),
          employees: emp.list,
          pinned: emp.pinned,
          navButtons: navButtons
        };
      }

      default:
        throw new Error('Unknown action: ' + action);
    }
  }

  window.callApi = function (action, payload) {
    // 1. Apps Script-hosted page → use in-runtime channel.
    if (window.google && window.google.script && window.google.script.run) {
      return new Promise(function (resolve, reject) {
        var runner = google.script.run.withSuccessHandler(resolve).withFailureHandler(reject);
        if (payload === undefined) runner[action]();
        else runner[action](payload);
      });
    }

    // 2. Static page + Apps Script web-app deployment → fetch.
    if (window.AS_URL) {
      var req = (payload === undefined)
        ? fetch(window.AS_URL + '?api=' + encodeURIComponent(action))
        : fetch(window.AS_URL, {
            method: 'POST',
            // text/plain avoids a CORS preflight Apps Script can't answer.
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: action, payload: payload })
          });
      return req
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (j) { if (j && j.error) throw new Error(j.error); return j; });
    }

    // 3. Pure local — use LOCAL_DATA + localStorage.
    return new Promise(function (resolve, reject) {
      try { resolve(localHandle(action, payload)); }
      catch (err) { reject(err); }
    });
  };
})();

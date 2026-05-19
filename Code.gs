/**
 * ============================================================================
 * Anant Avinya Technologies — Task Management System
 * Powered By Altus Corp
 *
 * SETUP (Apps Script editor):
 *   1. Paste this file as "Code.gs".
 *   2. Add HTML files named "index" and "dashboard" (form.html / dashboard.html).
 *   3. Deploy > New deployment > Web app
 *        Execute as:     Me
 *        Who has access: Anyone, even anonymous   (required for fetch() from
 *                                                   the static login page)
 *   4. Copy the /exec URL. Paste it into D:\AATech\login\api.js as AS_URL.
 *
 *   The single deployment URL serves both UI templates AND the JSON API:
 *     GET  /exec                       → index template (form)
 *     GET  /exec?page=dashboard        → dashboard template
 *     GET  /exec?api=getFormData       → JSON
 *     GET  /exec?api=getDashboardData  → JSON
 *     GET  /exec?api=getNavButtons     → JSON
 *     POST /exec  body={action,payload}→ JSON   (submitForm, addNavButton)
 * ============================================================================
 */

// ----- CONFIG -----------------------------------------------------------------
var FORM_UPLOADS_FOLDER = 'AAtech_Form_Uploads';
var RESPONSES_SHEET     = 'Responses';
var NAMES_SHEET         = 'Names';
var NAVBUTTONS_SHEET    = 'NavButtons';
var WEBSITE_REPORT      = 'Website Report';

var RESPONSE_HEADERS = [
  'Timestamp', 'Subject of Work', 'Client Name', 'Task Initiator', 'Task Doer',
  'Task', 'Priority of Task', 'Due Date', 'Initiator Notes', 'Attachment 1', 'Attachment 2'
];

// ----- ROUTING ---------------------------------------------------------------
function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};

  // JSON API branch — called by login/api.js when running outside Apps Script.
  if (params.api) {
    return _apiResponse(function () {
      switch (params.api) {
        case 'getFormData':       return getFormData();
        case 'getDashboardData':  return getDashboardData();
        case 'getNavButtons':     return getNavButtons();
        default: throw new Error('Unknown api: ' + params.api);
      }
    });
  }

  var page = params.page ? String(params.page) : 'index';
  var template, title;
  if (page === 'dashboard') {
    template = HtmlService.createTemplateFromFile('dashboard');
    title = 'AA Technologies — Work Management Dashboard';
  } else {
    template = HtmlService.createTemplateFromFile('index');
    title = 'AA Technologies — Assign Work';
  }
  return template.evaluate()
    .setTitle(title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  return _apiResponse(function () {
    var body = {};
    try { body = JSON.parse((e.postData && e.postData.contents) || '{}'); }
    catch (err) { throw new Error('Invalid JSON body'); }

    switch (body.action) {
      case 'submitForm':    return submitForm(body.payload || {});
      case 'addNavButton':  return addNavButton(body.payload || {});
      default: throw new Error('Unknown action: ' + body.action);
    }
  });
}

function _apiResponse(fn) {
  var result;
  try {
    result = fn();
  } catch (err) {
    result = { error: err && err.message ? err.message : String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ----- FORM DATA -------------------------------------------------------------
function getFormData() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(NAMES_SHEET);
  if (!sh) {
    throw new Error('Sheet "' + NAMES_SHEET + '" not found. Create it with col A = employees, col B = subjects.');
  }
  var lastRow = sh.getLastRow();
  var employees = [];
  var pinned = '';
  if (lastRow >= 2) {
    var aVals = sh.getRange(2, 1, lastRow - 1, 1).getValues();
    var rest = [];
    for (var i = 0; i < aVals.length; i++) {
      var v = String(aVals[i][0] || '').trim();
      if (!v) continue;
      if (i === 0) pinned = v;
      else rest.push(v);
    }
    rest.sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });
    if (pinned) employees.push(pinned);
    for (var j = 0; j < rest.length; j++) {
      if (rest[j].toLowerCase() !== pinned.toLowerCase()) employees.push(rest[j]);
    }
  }

  var subjects = [];
  if (lastRow >= 2) {
    var bVals = sh.getRange(2, 2, lastRow - 1, 1).getValues();
    for (var k = 0; k < bVals.length; k++) {
      var s = String(bVals[k][0] || '').trim();
      if (s) subjects.push(s);
    }
    subjects.sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });
  }

  return {
    employees: employees,
    pinned: pinned,
    subjects: subjects,
    navButtons: getNavButtons()
  };
}

// ----- SUBMIT ----------------------------------------------------------------
function submitForm(data) {
  data = data || {};
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(RESPONSES_SHEET);
  if (!sh) {
    sh = ss.insertSheet(RESPONSES_SHEET);
    sh.getRange(1, 1, 1, RESPONSE_HEADERS.length).setValues([RESPONSE_HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }

  var att1 = _storeAttachment(data.attachment1);
  var att2 = _storeAttachment(data.attachment2);

  var row = [
    new Date(),
    data.subject || '',
    data.clientName || '',
    data.taskInitiator || '',
    data.taskDoer || '',
    data.task || '',
    data.priority || '',
    data.dueDate ? new Date(data.dueDate) : '',
    data.notes || '',
    att1,
    att2
  ];
  sh.appendRow(row);
  return { ok: true };
}

function _storeAttachment(att) {
  if (!att || att.mode === 'none' || (!att.dataBase64 && !att.link)) return '';
  if (att.mode === 'link' && att.link) return String(att.link);
  if (att.mode === 'file' && att.dataBase64) {
    try {
      var folder = _getOrCreateFolder(FORM_UPLOADS_FOLDER);
      var bytes  = Utilities.base64Decode(att.dataBase64);
      var blob   = Utilities.newBlob(bytes, att.mimeType || 'application/octet-stream', att.name || 'upload');
      var file   = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return file.getUrl();
    } catch (err) {
      return 'UPLOAD_ERROR: ' + err.message;
    }
  }
  return '';
}

function _getOrCreateFolder(name) {
  var iter = DriveApp.getFoldersByName(name);
  if (iter.hasNext()) return iter.next();
  return DriveApp.createFolder(name);
}

// ----- DASHBOARD DATA --------------------------------------------------------
function getDashboardData() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(WEBSITE_REPORT);
  if (!sh) {
    return { rows: [], pinned: '', employees: [], error: 'Sheet "' + WEBSITE_REPORT + '" not found.' };
  }
  var lastRow = sh.getLastRow();
  var out = [];
  if (lastRow >= 2) {
    var range = sh.getRange(2, 2, lastRow - 1, 13).getValues();   // B..N
    for (var i = 0; i < range.length; i++) {
      var r = range[i];
      var anyVal = false;
      for (var c = 0; c < r.length; c++) { if (r[c] !== '' && r[c] !== null) { anyVal = true; break; } }
      if (!anyVal) continue;
      out.push({
        timestamp     : _serialize(r[0]),
        subject       : _serialize(r[1]),
        clientName    : _serialize(r[2]),
        taskInitiator : _serialize(r[3]),
        taskDoer      : _serialize(r[4]),
        task          : _serialize(r[5]),
        priority      : _serialize(r[6]),
        dueDate       : _serialize(r[7]),
        taskStatus    : _serialize(r[12])
      });
    }
  }

  var fd = getFormData();
  return { rows: out, employees: fd.employees, pinned: fd.pinned, navButtons: fd.navButtons };
}

function _serialize(v) {
  if (v instanceof Date) return v.toISOString();
  return v == null ? '' : v;
}

// ----- NAV BUTTONS -----------------------------------------------------------
function getNavButtons() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(NAVBUTTONS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(NAVBUTTONS_SHEET);
    sh.getRange(1, 1, 1, 2).setValues([['Button Name', 'Link']]).setFontWeight('bold');
    sh.setFrozenRows(1);
    return [];
  }
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  var vals = sh.getRange(2, 1, lastRow - 1, 2).getValues();
  var out = [];
  for (var i = 0; i < vals.length; i++) {
    var name = String(vals[i][0] || '').trim();
    var link = String(vals[i][1] || '').trim();
    if (name && link) out.push({ name: name, link: link });
  }
  return out;
}

/**
 * Accepts either:
 *   addNavButton({ name: 'X', link: 'Y' })   (new — used by JSON bridge)
 *   addNavButton('X', 'Y')                   (legacy two-arg signature)
 */
function addNavButton(nameOrPayload, link) {
  var name;
  if (nameOrPayload && typeof nameOrPayload === 'object') {
    name = String(nameOrPayload.name || '').trim();
    link = String(nameOrPayload.link || '').trim();
  } else {
    name = String(nameOrPayload || '').trim();
    link = String(link || '').trim();
  }
  if (!name || !link) throw new Error('Both name and link are required.');
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(NAVBUTTONS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(NAVBUTTONS_SHEET);
    sh.getRange(1, 1, 1, 2).setValues([['Button Name', 'Link']]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  sh.appendRow([name, link]);
  return getNavButtons();
}

// ----- onEdit: auto-create per-employee sheet --------------------------------
function onEdit(e) {
  try {
    if (!e || !e.range) return;
    var sh = e.range.getSheet();
    if (sh.getName() !== NAMES_SHEET) return;
    if (e.range.getColumn() !== 1) return;
    if (e.range.getRow() < 2) return;

    var newName = String(e.value || '').trim();
    if (!newName) return;

    var ss = sh.getParent();
    if (ss.getSheetByName(newName)) return;

    var templateName = String(sh.getRange('A2').getValue() || '').trim();
    if (!templateName) return;
    if (newName === templateName) return;

    var template = ss.getSheetByName(templateName);
    if (!template) return;

    var copy = template.copyTo(ss);
    copy.setName(newName);
    copy.getRange('A1').setValue(newName);

    var safeName = newName.replace(/"/g, '""');
    var formula = '=FILTER(Responses!A2:L,Responses!E2:E="' + safeName + '")';
    copy.getRange('B8').setFormula(formula);
  } catch (err) {
    console.error('onEdit error: ' + err.message);
  }
}

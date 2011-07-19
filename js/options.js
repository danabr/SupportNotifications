/*
  Javascript for the options page
*/
function initForms() {
  initAuthenticationDetailsForms();
  initNotificationsForm();
  document.getElementById("master_password").focus();
}

// Fetches the contents of the resource with the given name
function loadTemplate(name) {
  var req = new XMLHttpRequest();
  req.open("GET", "templates/" + name, false);
  req.send();
  return req.responseText;
}

// Returns a string where the contents of the given
// template are replaced by the data in the given data object.
function applyTemplate(template, dataObject) {
  var result = template.substr(0); // Copy
  for(var replace in dataObject) {
    var regexp = new RegExp("{{{" + replace + "}}}", "gm");
    result = result.replace(regexp, dataObject[replace]);
  }
  return result;
}

// Creates the authentication details forms for the various providers
function initAuthenticationDetailsForms() {
  var bg = chrome.extension.getBackgroundPage();
  for(var providerName in bg.SupportNotifications.providers) {
    var provider = bg.SupportNotifications.providers[providerName];
    // Only reason we use a form here is that Chrome does not
    // support the "let" keyword (and javascript is function scoped,
    // not block scoped).
    initProviderForm(providerName, provider);
  }
}

function initNotificationsForm() {
  var form = document.getElementById("notification_form");
  var bg = chrome.extension.getBackgroundPage();
  var notifications = bg.SupportNotifications.Notifications;
  form.display_notifications.checked = notifications.notifications_on;
  form.play_sound.checked = notifications.sound_on;
  var interval = notifications.interval.toString();
  for (var i = 0, l = form.update_interval.length; i < l; i++) {
    if (form.update_interval[i].value == interval) {
      form.update_interval[i].selected = true;
    }
  }
  
  form.onsubmit = function() {
    notifications.notifications_on = form.display_notifications.checked;
    notifications.sound_on = form.play_sound.checked;
    notifications.interval = form.update_interval[form.update_interval.selectedIndex].value;
    saveConfig();
    return false;
  }
}

function initProviderForm(providerName, provider) {
  var formContainer = document.getElementById("authentication_forms");
  var template = loadTemplate(providerName.toLowerCase() + ".template");
  var templateData = provider.formData();
  var formHTML = applyTemplate(template, templateData);
  var formWrapper = document.createElement("div");
  formWrapper.innerHTML = formHTML;
  formContainer.appendChild(formWrapper)
  
  var form = formWrapper.firstChild;
  form.onsubmit = function() {
    provider.initFromForm(form);
    saveConfig();
    return false;
  }
  
  if(form.test_button !== undefined) {
    form.test_button.onclick = function() {
      var result = provider.testCredentials(form);
      var info = document.getElementById("info");
      if(result === "valid") {
        info.innerHTML = "Successful authentication!";
        info.className = "success";
      } else if(result === "invalid") {
        info.innerHTML = "Failed to authenticate!";
        info.className = "error";
      } else {
        info.innerHTML = "The service seems to be unavailable at the moment.";
        info.className = "info";
      }
    }
  }
}

function saveConfig() {
  var bg = chrome.extension.getBackgroundPage();
  var info = document.getElementById("info");
  if (!bg.saveConfig(document.getElementById("master_password").value)) {
    info.innerHTML = "The provided master password is too short.";
    info.className = "error";
  } else {
    info.innerHTML = "Your settings have been saved.";
    info.className = "success";
  }
}
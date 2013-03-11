/*
  Javascript for the options page
*/

document.addEventListener("DOMContentLoaded", function() {
  initForms();
  // Dummy notification timer
  notificationTimer = setTimeout(function() {}, 30000);
});

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
  var sections = document.getElementById("sections");
  for(var providerName in bg.SupportNotifications.providers) {
    var provider = bg.SupportNotifications.providers[providerName];
    // Only reason we use a function here is that Chrome does not
    // support the "let" keyword (and javascript is function scoped,
    // not block scoped).
    initProviderForm(providerName, provider);
    
    // Create provider link in the left menu
    var link = document.createElement("a");
    link.href = "#" + providerName.toLowerCase();
    link.innerHTML = providerName;
    sections.appendChild(link);
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
      if(result === "valid") {
        notify("success", "Successful authentication!");
      } else if(result === "invalid") {
        notify("error", "Failed to authenticate!");
      } else {
        notify("info", "The service seems to be unavailable at the moment.");
      }
    }
  }
}

function saveConfig() {
  var bg = chrome.extension.getBackgroundPage();
  var masterPwd = document.getElementById("master_password");
  var pwd = masterPwd.value;
  if (!bg.saveConfig(pwd)) {
    if (pwd.length == 0) {
      notify("info", "You must specify your master password in order to save your data.");
    } else {
      notify("error", "The provided master password is too short.");
    }
    masterPwd.focus();
  } else {
    notify("success", "Your settings have been saved."); 
  }
}

/*
  status = "success"|"error"|"info"
*/
function notify(status, message) {
  var top_panel = document.getElementById("top_panel");
  // Hide infobar after a while
  clearTimeout(notificationTimer);
  notificationTimer = setTimeout(function() {
    top_panel.style.display = "none";
    }, 10000);
  // Display top panel  
  top_panel.className = status;
  top_panel.innerHTML = message;
  top_panel.style.display = "block";
  
}

/*
  Javascript for the options page
*/
function initForms() {
  initAuthenticationDetailsForms();
  initNotificationsForm();
}

// Fetches the contents of the resource with the given name
function loadTemplate(name) {
  var req = new XMLHttpRequest();
  req.open("GET", name, false);
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

// Returns template data for the authentication form
function formData(providerName, provider) {
  return {
    companyId: provider.companyId,
    checked: (provider.enabled ? "checked=\"checked\"" : ""),
    providerName: providerName,
    username: provider.username
  };
}

// Creates the authentication details forms for the various providers
function initAuthenticationDetailsForms() {
  var formContainer = document.getElementById("authentication_forms");
  var bg = chrome.extension.getBackgroundPage();
  var template = loadTemplate("authentication_form.template");
  for(var providerName in bg.SupportNotifications.providers) {
    var provider = bg.SupportNotifications.providers[providerName];
    var templateData = formData(providerName, provider);
    var formHTML = applyTemplate(template, templateData);
    formContainer.innerHTML = formHTML;
    var form = formContainer.firstChild;
    
    form.onsubmit = function() {
      provider.enabled = form.enabled.checked;
      provider.companyId = form.company_id.value;
      provider.username = form.username.value;
      provider.password = form.password.value;
      if (!bg.saveConfig(document.getElementById("master_password").value)) {
        alert("Master password too short");
      };
      return false;
    }
    
    form.test_button.onclick = function() {
      alert(provider.testCredentials(
        form.company_id.value, 
        form.username.value, 
        form.password.value));
    }
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
    if(!bg.saveConfig(document.getElementById("master_password").value)) {
      alert("Master password too short");
    };
    return false;
  }
}
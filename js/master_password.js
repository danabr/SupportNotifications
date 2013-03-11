document.addEventListener("DOMContentLoaded", function() {
  var bg = chrome.extension.getBackgroundPage();
  var form = document.getElementById("password_form");
  var errorElement = document.getElementById("error");
  form.onsubmit = function() {
    if (form.master_password.value.length < 6) {
      errorElement.innerHTML = "Password to short";
    } else if (bg.loadConfig(form.master_password.value)) {
      chrome.browserAction.setPopup({popup: "popup.html"});
      bg.updateStatus();
      bg.scheduleStatusUpdate();
      window.close();
    } else {
      errorElement.innerHTML = "Incorrect password";
    }
    return false;
  }
  form.master_password.focus();
});

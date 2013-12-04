/*
  Public API
*/

// Persistent
SupportNotifications = {
  version: "1.2.0",
  providers: {},
  Notifications: {
    interval: 1,
    sound_on: true,
    notifications_on: true,
    alert_on_update: false
  },
  TicketProvider : function(name, properties) {
    this.name = name;
    this.enabled = false;
    for(var propName in properties) {
      this[propName] = properties[propName];
    }
  }
};
// Non-persistent
Tickets = {};


// Remove everything from local storage so that a new master password can be
// selected and the extension reconfigured.
function resetConfig() {
  localStorage.clear();
}

// Load from local storage
function loadConfig(masterPassword) {
  if(localStorage.data !== undefined) {
    try {
      var encrypted = JSON.parse(localStorage.data);
      SupportNotifications = JSON.parse(sjcl.decrypt(masterPassword, encrypted));
    } catch(err) {
      console.log(err);
      return false;
    }
  }

  // Mix in provider functions
  for(var providerName in SupportNotifications.providers) {
    SupportNotifications.providers[providerName].__proto__ = 
      window[providerName];
    SupportNotifications.providers[providerName].afterLoad();
  }
  
  return true;
}

/*
  Saves configuration to local storage.
  Returns true if the master password was long enough
  and data was saved to disk.
*/
function saveConfig(masterPassword) {
  if(masterPassword.length > 5) {
    var json = JSON.stringify(SupportNotifications);
    var encrypted = sjcl.encrypt(masterPassword, json);
    localStorage.data = JSON.stringify(encrypted);
    return true;
  }
  return false;
}

/*
  Private API
*/

// Initial string to use for lastTicketCreated
function _defaultTicketDate() {
  function _twodigits(number) {
    if(number <= 9) { return "0" + number};
    return number.toString();
  }
  var now = new Date();
  return [now.getFullYear(), _twodigits(now.getMonth()+1), 
    _twodigits(now.getDate())].join("/");
}

function _notifyAboutTicket(provider, ticket) {
  var notification = webkitNotifications.createNotification('lgpl/48.png', 
                                                            provider.name, 
                                                            ticket.subject)
  notification.onclick = function() {
    chrome.tabs.create({'url': provider.getTicketURL(ticket)});
  }
  notification.show();
}

function _notifyIfEnabled(provider, ticket) {
  if(SupportNotifications.Notifications.notifications_on) {
    _notifyAboutTicket(provider, ticket);
  }
}

function scheduleStatusUpdate() {
  var interval = SupportNotifications.Notifications.interval * 60 * 1000;
  setTimeout(function() { updateStatus(); scheduleStatusUpdate(); }, interval);
}

function _updateProviderStatus(providerName, provider) {
  var ticketData = provider.getTicketData();
  var tickets = ticketData.tickets;
  var alertOnUpdate = SupportNotifications.Notifications.alert_on_update;
  var playSound = false;
  var createVar = providerName + ".lastTicketCreated";
  var updateVar = providerName + ".lastTicketUpdated";
  var lastTicketCreated = localStorage[createVar] || _defaultTicketDate();
  var lastTicketUpdated = localStorage[updateVar] || new Date().toString();
  var i = tickets.length;
  while(i--) {
    var ticket = tickets[i];
    var ticketUpdate = false;
    newlyCreated = new Date(ticket.created_at) > new Date(lastTicketCreated);
    newlyUpdated = new Date(ticket.updated_at) > new Date(lastTicketUpdated);
    if (newlyCreated) {
      playSound = true;
      lastTicketCreated = ticket.created_at;
      if(ticket.created_at > lastTicketUpdated) {
        lastTicketUpdated = ticket.created_at; // Avoid double alert after create
      }
      _notifyIfEnabled(provider, ticket);
    } else if(newlyUpdated) {
      lastTicketUpdated = ticket.updated_at;
      if (alertOnUpdate) {
        playSound = true;
        _notifyIfEnabled(provider, ticket);
      }
    }
  }

  localStorage[createVar] = lastTicketCreated;
  localStorage[updateVar] = lastTicketUpdated;
  Tickets[providerName] = {latestTicket: ticketData.latest, total: ticketData.total};
  return playSound;
}

function updateStatus() {
  var numTickets = 0;
  var newTickets = false;
  var errors = false;
  for(var providerName in SupportNotifications.providers) {
    var provider = SupportNotifications.providers[providerName];
    if(provider.enabled) {
      try {
        if(_updateProviderStatus(providerName, provider)) {
          newTickets = true;
        }
        numTickets += Tickets[providerName].total;
      }
      catch(err) {
        errors = true;
        console.log((new Error()).stack);
        console.log(err); // Provider not available?
      }
    }
  }
  
  if (errors) {
    chrome.browserAction.setBadgeBackgroundColor({color: [255, 188, 66, 255] });
    chrome.browserAction.setTitle({title: "Last update attempt failed."});
  } else {
    chrome.browserAction.setBadgeBackgroundColor({color: [123, 170, 30, 255] });
    chrome.browserAction.setBadgeText({text: numTickets.toString()});
    chrome.browserAction.setTitle({title: "SupportNotifications"});
  }
  if (newTickets && SupportNotifications.Notifications.sound_on) {
    var audio = document.getElementById("notification_audio");
    audio.play();
  }
}

/*
  Initialization
*/
chrome.browserAction.setBadgeBackgroundColor({color: [255, 188, 66, 255] });
chrome.browserAction.setBadgeText({text: "?" });

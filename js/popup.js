function initData() {
  var bg = chrome.extension.getBackgroundPage();
  var latestTickets = document.getElementById("latest_tickets");
  for(var providerName in bg.SupportNotifications.providers) {
    var provider = bg.SupportNotifications.providers[providerName];
    if (bg.Tickets[providerName]) {
      var latestTicket = bg.Tickets[providerName].latestTicket;
      var ticketCount =  bg.Tickets[providerName].total;
    }
    var container = document.createElement("div");
    if (provider.enabled) {      
      var container = document.createElement("div");
      var h = document.createElement("h3");
      var providerLink = document.createElement("a");
      providerLink.href = provider.getTicketsURL();
      providerLink.target = "_blank";
      providerLink.appendChild(document.createTextNode(provider.name +
          " (" + (ticketCount || "?") + ")"));
      h.appendChild(providerLink);
      container.appendChild(h);
      if (latestTicket !== undefined) {
        var anchor = document.createElement("a");
        anchor.href = provider.getTicketURL(latestTicket);
        anchor.target = "_blank";
        anchor.appendChild(document.createTextNode(latestTicket.subject));
        container.appendChild(anchor);
      } else {
        container.appendChild(document.createTextNode("Ticket data not loaded yet."));
      }
      latestTickets.appendChild(container);
    }
    
   
  }
  
  var optionsLink = document.getElementById("options_link");
  optionsLink.href = chrome.extension.getURL("options.html");
  
  var updateLink = document.getElementById("update_link");
  updateLink.onclick = function() {
    bg.updateStatus();
    window.location.reload();
  }
}
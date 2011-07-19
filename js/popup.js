function initData() {
  var bg = chrome.extension.getBackgroundPage();
  var openTickets = document.getElementById("open_tickets");
  var latestTickets = document.getElementById("latest_tickets");
  for(var providerName in bg.SupportNotifications.providers) {
    var provider = bg.SupportNotifications.providers[providerName];
    var tickets = bg.Tickets[providerName] || [];
    var container = document.createElement("div");
    if (!provider.enabled) {
      container.className = "disabled";
    }
    container.appendChild(document.createTextNode(provider.name + ": "));
    var anchor = document.createElement("a");
    anchor.appendChild(document.createTextNode(tickets.length));
    anchor.href = provider.getTicketsURL();
    anchor.target = "_blank";
    container.appendChild(anchor);
    openTickets.appendChild(container);
    
    var latestTicket = tickets[0];
    if (latestTicket !== undefined) {
      container = document.createElement("div");
      var h = document.createElement("h3");
      h.appendChild(document.createTextNode(provider.name));
      container.appendChild(h);
      var title = document.createElement("h4");
      anchor = document.createElement("a");
      anchor.appendChild(document.createTextNode(latestTicket.subject));
      anchor.href = provider.getTicketURL(latestTicket);
      anchor.target = "_blank";
      title.appendChild(anchor);
      container.appendChild(title);
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
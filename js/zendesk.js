if(SupportNotifications.providers.Zendesk === undefined) {
  SupportNotifications.providers.Zendesk = 
    new SupportNotifications.TicketProvider("Zendesk");
};

Zendesk = {
  getOpenTickets: function() {
    var url = this.getTicketsURL() + ".json";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false, this.username, this.password);
    xhr.send();
    return JSON.parse(xhr.responseText).sort(function(a, b) {
      if(a.updated_at < b.updated_at) {
        return 1;
      } else {
        return -1;
      }
    });
  },

  getTicketURL: function(ticket) {
  return "http://" + this.companyId + ".zendesk.com/tickets/" + ticket.nice_id;
  },
  
  getTicketsURL: function(companyId) {
  cmp = companyId || this.companyId;
  return "http://" + cmp + ".zendesk.com/rules/871014";
  },

  /*
    Tests the given credentials for authentication.
    Returns "valid", "invalid" or "unknown".
  */
  testCredentials: function(companyId, username, password) {
    var url = this.getTicketsURL(companyId) + ".json";
    var xhr = new XMLHttpRequest();
    try {
      xhr.open("GET", url, false, username, password);
      xhr.send();
      if(xhr.status === 200) {
        return "valid";
      } else if(xhr.status === 401 || xhr.status == 404) {
        return "invalid";
      } else {
        return "unkown";
      }
    }
    catch(error) {
      console.log(error);
      return "unknown";
    }
  }
};
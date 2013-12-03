SupportNotifications.providers.GetSatisfaction = 
    new SupportNotifications.TicketProvider("GetSatisfaction",
    {companyId: "company"});

GetSatisfaction = {
  afterLoad: function() {
  },
  
  // Returns template data for the authentication form
  formData: function() {
    return {
      companyId: this.companyId,
      checked: (this.enabled ? "checked=\"checked\"" : "")
    };
  },

  getTicketData: function() {
    var newTickets = this._getTicketsByStatus("nil");
    var plannedTickets = this._getTicketsByStatus("active");
    var consideredTickets = this._getTicketsByStatus("pending");
    var tickets = newTickets.tickets.concat(plannedTickets.tickets, 
                                            consideredTickets.tickets);
    tickets.sort(function(a, b) {
      if(a.updated_at < b.updated_at) {
        return 1;
      } else {
        return -1;
      }
    });

    var latest = null;
    for(index in tickets) {
      var ticket = tickets[index];
      if(latest == null || ticket.created_at > latest.created_at) {
        latest = ticket;
      }
    }

    var total = newTickets.total + plannedTickets.total + consideredTickets.total;
    return {tickets: tickets, latest: latest, total: tickets.length};
  },
  
  _getTicketsByStatus: function(status) {
    var url = this._getTicketsAPIURL() + "?status=" + status;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    var data = JSON.parse(xhr.responseText);
    return {tickets: data.data, total: data.total};
  },

  getTicketURL: function(ticket) {
    return ticket.at_sfn;
  },
  
  _getTicketsAPIURL: function(companyId) {
    var cmp = companyId || this.companyId;
    return "http://api.getsatisfaction.com/companies/" + cmp + "/topics.json";
  },
  
  getTicketsURL: function() {
    return "http://getsatisfaction.com/" + this.companyId + "/topics";
  },
 
  initFromForm: function(form) {
    this.enabled = form.enabled.checked;
    this.companyId = form.company_id.value;
  },

  /*
    Tests authentication with the credentials given in the form.
    Returns "valid", "invalid" or "unknown".
  */
  testCredentials: function(form) {
    var companyId = form.company_id.value;
    var url = this._getTicketsAPIURL(companyId);
    var xhr = new XMLHttpRequest();
    try {
      xhr.open("GET", url, false);
      xhr.send();
      if(xhr.status === 200) {
        return "valid";
      } else if(xhr.status === 404) {
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

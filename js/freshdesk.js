SupportNotifications.providers.Freshdesk =
    new SupportNotifications.TicketProvider("Freshdesk",
    {password: "", username: "", companyId: "company"});

Freshdesk = {
  _callFreshdesk: function(url, username, password) {
    var xhr = new XMLHttpRequest();
    console.log("GET " + url);
    xhr.open("GET", url, false,
      username || this.username, password || this.password);
    xhr.send();
    return xhr;
  },

  afterLoad: function() { },

  // Returns template data for the authentication form
  formData: function() {
    return {
      companyId: this.companyId,
      checked: (this.enabled ? "checked=\"checked\"" : ""),
      username: this.username
    };
  },

  getTicketData: function() {
    var ticketsURL = this.getTicketsURL().replace(/\?.+$/, ".json?filter_name=\"new_my_open\"");
    console.log("Tickets URL: " + ticketsURL);
    var xhr = this._callFreshdesk(ticketsURL);
    var tickets = JSON.parse(xhr.responseText).sort(function(a, b) {
      if(a.created_at < b.created_at) {
        return 1;
      } else {
        return -1;
      }
    });
    return {tickets: tickets, total: tickets.length};
  },

  getTicketURL: function(ticket) {
    return "http://" + this.companyId + ".freshdesk.com/helpdesk/tickets/" + ticket.display_id;
  },

  getTicketsURL: function(companyId) {
    var cmp = companyId || this.companyId;
    return "http://" + cmp + ".freshdesk.com/helpdesk/tickets?filter_name=new_my_open"
  },

  initFromForm: function(form) {
    this.enabled = form.enabled.checked;
    this.companyId = form.company_id.value;
    this.username = form.username.value;
    this.password = form.password.value;
  },

  /*
    Tests authentication with the credentials given in the form.
    Returns "valid", "invalid" or "unknown".
  */
  testCredentials: function(form) {
    var companyId = form.company_id.value;
    var username = form.username.value;
    var password = form.password.value;
    var url = this.getTicketsURL(companyId);
    try {
      var xhr = this._callFreshdesk(url, username, password);
      if(xhr.status === 200) {
        return "valid";
      } else if(xhr.status === 401 || xhr.status == 404) {
        return "invalid";
      } else {
        return "unkown";
      }
    }
    catch(error) {
      console.log("Failed to validate credentials!");
      console.log(error);
      return "unknown";
    }
  },
};

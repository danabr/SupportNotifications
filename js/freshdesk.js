SupportNotifications.providers.Freshdesk =
    new SupportNotifications.TicketProvider("Freshdesk",
    {password: "", username: "", companyId: "company", filterName: "new_my_open"});

Freshdesk = {
  _callFreshdesk: function(url, username, password) {
    var xhr = new XMLHttpRequest();
    console.log("GET " + url);
    xhr.open("GET", url, false,
      username || this.username, password || this.password);
    xhr.send();
    return xhr;
  },

  afterLoad: function() {
    if (this.filterName == null || this.filterName == undefined || this.filterName == "")
      this.filterName = "new_my_open"
  },

  // Returns template data for the authentication form
  formData: function() {
    return {
      companyId: this.companyId,
      checked: (this.enabled ? "checked=\"checked\"" : ""),
      username: this.username,
      filterName: this.filterName
    };
  },

  getTicketData: function() {
    var ticketsURL = this.getTicketsURL().replace(/\?.+$/, ".json?filter_name=" + this.filterName);
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
    return "http://" + cmp + ".freshdesk.com/helpdesk/tickets?filter_name=" + this.filterName;
  },

  initFromForm: function(form) {
    this.enabled = form.enabled.checked;
    this.companyId = form.company_id.value;
    this.username = form.username.value;
    this.password = form.password.value;
    this.filterName = form.filter_name.value;
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

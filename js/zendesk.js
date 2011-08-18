SupportNotifications.providers.Zendesk = 
    new SupportNotifications.TicketProvider("Zendesk",
    {password: "", username: "", companyId: "company"});

Zendesk = {
  _callZendesk: function(url, username, password) {
    xhr = new XMLHttpRequest();
    xhr.open("GET", url + ".json", false, 
      username || this.username, password || this.password);
    xhr.send();
    return xhr;
  },

  // Returns template data for the authentication form
  formData: function() {
    return {
      companyId: this.companyId,
      checked: (this.enabled ? "checked=\"checked\"" : ""),
      username: this.username
    };
  },

  getTicketData: function() {
    var xhr = this._callZendesk(this.getTicketsURL());
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
    return "http://" + this.companyId + ".zendesk.com/tickets/" + ticket.nice_id;
  },
  
  getTicketsURL: function(companyId) {
    var cmp = companyId || this.companyId;
    return "http://" + cmp + ".zendesk.com/rules/" + this._getRuleId(cmp);
  },

  _getViewsURL: function(companyId) {
    var cmp = companyId || this.companyId;
    return "http://" + cmp + ".zendesk.com/views";
  },

  /*
    Returns the rule to use for checking for new tickets.
    Uses the first rile/view
  */
  _getRuleId: function(companyId) {
    if (this.ruleId === undefined) {
      try {
        var xhr = this._callZendesk(this._getViewsURL(companyId));
        if (xhr.status == "200") {
          var views = JSON.parse(xhr.responseText)["views"];
          this.ruleId = views[0]["id"];
          return this.ruleId;
        } else {
          throw "Zendesk views not available. Status: " + xhr.status;  
        }
      } catch(err) {
        console.log("Failed to obtain Zendesk rule id!");
        console.log(err);
        return "871014"; // "My unsolved tickets"
      }
    } else {
      return this.ruleId;
    }
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
    var url = this._getViewsURL(companyId);
    try {
      var xhr = this._callZendesk(url, username, password);
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

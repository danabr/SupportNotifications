SupportNotifications.providers.Zendesk = 
    new SupportNotifications.TicketProvider("Zendesk",
      { password: ""
        , username: ""
        , companyId: "company"
        , protocol: "http"
      });

Zendesk = {
  _callZendesk: function(url, username, password) {
    xhr = new XMLHttpRequest();
    xhr.open("GET", url + ".json", false, 
      username || this.username, password || this.password);
    xhr.send();
    return xhr;
  },
  
  afterLoad: function() {
    if (this.protocol != "https")
      this.protocol = "http"
  },

  // Returns template data for the authentication form
  formData: function() {
    return {
      companyId: this.companyId,
      checked: this.enabled ? "checked" : "",
      username: this.username,
      use_https: this.protocol == "https" ? "checked" : ""
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
    return this.protocol + "://" + this.companyId + ".zendesk.com/tickets/" + ticket.nice_id;
  },
  
  getTicketsURL: function(protocol, companyId) {
    var cmp = companyId || this.companyId;
    var prot = protocol || this.protocol;
    return prot + "://" + cmp + ".zendesk.com/rules/" + this._getRuleId(prot, cmp);
  },

  _getViewsURL: function(protocol, companyId) {
    var cmp = companyId || this.companyId;
    var prot = protocol || this.protocol;
    return prot + "://" + cmp + ".zendesk.com/views";
  },

  /*
    Returns the rule to use for checking for new tickets.
  */
  _getRuleId: function(protocol, companyId) {
    if (this.ruleId === undefined) {
      try {
        var xhr = this._callZendesk(this._getViewsURL(protocol, companyId));
        if (xhr.status == "200") {
          this.ruleId = ZendeskHelpers.RuleSelector.select(JSON.parse(xhr.responseText)["views"]);
        } else {
          throw "Zendesk views not available. Status: " + xhr.status;  
        }
      } catch(err) {
        console.log("Failed to obtain Zendesk rule id!");
        console.log(err);
        return "871014"; // "My unsolved tickets"
      }
    }
    return this.ruleId;
  },
 
  initFromForm: function(form) {
    this.enabled = form.enabled.checked;
    this.companyId = form.company_id.value;
    this.username = form.username.value;
    this.password = form.password.value;
    this.protocol = form.use_https.checked ? "https" : "http";
  },

  /*
    Tests authentication with the credentials given in the form.
    Returns "valid", "invalid" or "unknown".
  */
  testCredentials: function(form) {
    var companyId = form.company_id.value;
    var username = form.username.value;
    var password = form.password.value;
    var protocol = form.use_https.checked ? "https" : "http";
    var url = this._getViewsURL(protocol, companyId);
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
  },
};

ZendeskHelpers = {
  RuleSelector: {
    select: function(views) {
      var regex = /SupportNotifications/;
      var viewId = views[0].id; //Default
      views.forEach(function (view){
        if(regex.test(view.title)) {
          viewId = view.id;
        }
      });
      return viewId;
    }
  }
};

SupportNotifications.providers.GetSatisfaction = 
    new SupportNotifications.TicketProvider("GetSatisfaction",
    {companyId: "company"});

GetSatisfaction = {
  // Returns template data for the authentication form
  formData: function() {
    return {
      companyId: this.companyId,
      checked: (this.enabled ? "checked=\"checked\"" : "")
    };
  },

  getTicketStatus: function() {
    var url = this._getTicketsAPIURL();
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    /*
      TODO: We actually return only the 15 most recent topics,
      which will result in an incorrect "total" number.
      This is something we should solve in the infrastructure code, though.
    */
    var active = JSON.parse(xhr.responseText).data.filter(function(topic) {
      return (topic.status !== "rejected" && topic.status !== "completed")
    });
    return active.sort(function(a, b) {
      if(a.created_at < b.created_at) {
        return 1;
      } else {
        return -1;
      }
    });
  },

  getTicketURL: function(ticket) {
    return ticket.at_sfn;
  },
  
  _getTicketsAPIURL: function(companyId) {
    var cmp = companyId || this.companyId;
    return "http://api.getsatisfaction.com/companies/" + cmp + "/topics.json" +
      "?sort=recently_created";
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
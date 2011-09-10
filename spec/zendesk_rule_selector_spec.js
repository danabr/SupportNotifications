describe("ZendeskHelpers.RuleSelector", function() {
  it("Should choose the first view if there are no appropriate ones", function() {
    var views = [
      {id: 1, title: "Title"}, {id: 2, title: "Another title"}
    ];
    var res = ZendeskHelpers.RuleSelector.select(views);
    expect(res).toEqual(1);
  });
  
  it("Shold choose SupportNotifications view if available", function() {
    var views = [
      {
        id: 1,
        title: "Inappropriate"
      },
      {
        id: 2,
        title: "contains SupportNotifications"
      },
    ];
    var res = ZendeskHelpers.RuleSelector.select(views);
    expect(res).toEqual(2);
  });
});
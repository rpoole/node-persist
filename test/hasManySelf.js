
var persist = require("../lib/persist");
var type = persist.type;
var nodeunit = require("nodeunit");
var util = require("util");
var testUtils = require("../test_helpers/test_utils");

exports['HasManySelf'] = nodeunit.testCase({
  setUp: function(callback) {
    var self = this;

    this.Person = persist.define("Person", {
      "name": type.STRING
    });

    this.Person = this.Person.hasOne(this.Person, {
      foreignKey: 'manager_id',
      name: 'manager',
    });

    testUtils.connect(persist, {}, function(err, connection) {
      if (err) { 
        console.log(err); 
        return; 
      }

      self.connection = connection;

      var data = [];
      data.push(self.manager1 = new self.Person({ 
        name: 'mark' 
      }));
      data.push(self.employee1 = new self.Person({ 
        name: "lisa",
        manager: self.manager1
      }));
      data.push(self.employee2 = new self.Person({ 
        name: "danny",
        manager: self.manager1
      }));

      self.connection.save(data, function(err) {
        if (err) { 
          console.log(err); 
          return; 
        }

        callback();
      });
    });
  },

  tearDown: function(callback) {
    if (this.connection) {
      this.connection.close();
    }
    callback();
  },

  "includeManager": function(test) {
    var self = this;
    this.Person.using(this.connection)
    .include('manager')
    .all(function(err, people) {
      if (err) {
        return;
      }

      test.equals(people[0].name, self.manager1.name);
      test.equals(people[1].name, self.employee1.name);
      test.equals(people[2].name, self.employee2.name);

      test.equals(people[1].manager.id, self.manager1.id);
      test.equals(people[2].manager.id, self.manager1.id);

      test.equals(people[0].manager, null);

      test.done();
    });
  },

  "subordinates": function(test) {
    //TODO add a test so you can do
    //hasManyName: subordinates and get
    //back all of the employees that have a
    //given manager
    test.done();
  },
});

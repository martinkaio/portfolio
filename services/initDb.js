var initDb = function(callback, app, url, dbDetails, urlLabel, database) {
  if (url == null) return;

  var mongodb = require("mongodb");
  if (mongodb == null) return;

  mongodb.connect(url, function(err, client) {
    if (err) {
      callback(err);
      return;
    }

    app.locals.db = client.db(database);
    app.locals.dbDetails.databaseName = app.locals.db.databaseName;
    app.locals.dbDetails.url = urlLabel;
    app.locals.dbDetails.type = "MongoDB";

    console.log("Connected to MongoDB at: %s", url);
    if (!request.app.locals.db) {
      console.log("No DB %s", url);
    }
  });
};

module.exports = initDb;

var initDb = function(callback, url, dbDetails, urlLabel, database) {
  if (url == null) return;

  request.app.locals.mongodb = require("mongodb");
  if (request.app.locals.mongodb == null) return;

  request.app.locals.mongodb.connect(url, function(err, client) {
    if (err) {
      callback(err);
      return;
    }

    request.app.locals.db = client.db(database);
    request.app.locals.dbDetails.databaseName =
      request.app.locals.db.databaseName;
    request.app.locals.dbDetails.url = urlLabel;
    request.app.locals.dbDetails.type = "MongoDB";

    console.log("Connected to MongoDB at: %s", url);
    if (!request.app.locals.db) {
      console.log("No DB");
    }
  });
};

module.exports = initDb;

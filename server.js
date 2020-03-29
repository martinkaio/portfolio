const express = require("express");
const path = require("path");
const cookieSession = require("cookie-session");
const createError = require("http-errors");
var initDb = require("./services/initDb");

Object.assign = require("object-assign");

const app = express();
const routes = require("./routes");

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
const ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0";
var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL;
var mongoURLLabel = "";

app.set("trust proxy", 1);

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"]
  })
);

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + "_SERVICE_HOST"];
    mongoPort = process.env[mongoServiceName + "_SERVICE_PORT"];
    mongoDatabase = process.env[mongoServiceName + "_DATABASE"];
    mongoPassword = process.env[mongoServiceName + "_PASSWORD"];
    mongoUser = process.env[mongoServiceName + "_USER"];

    // If using env vars from secret from service binding
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = "mongodb://";
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ":" + mongoPassword + "@";
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ":" + mongoPort + "/" + mongoDatabase;
    mongoURL += mongoHost + ":" + mongoPort + "/" + mongoDatabase;
  }
}

app.locals.mongoURL = mongoURL;
app.locals.mongoURLLabel = mongoURLLabel;
app.locals.ip = ip;
app.locals.mongoDatabase = mongoDatabase;

var db = null;
var dbDetails = new Object();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.locals.siteName = "Martin Kaio";

app.use(express.static(path.join(__dirname, "./static")));

app.use("/", routes());

app.use((request, response, next) => {
  return next(createError(404, "File not found"));
});

app.use((err, request, response, next) => {
  response.locals.message = err.message;
  console.error(err);
  const status = err.status || 500;
  response.locals.status = status;
  response.status(status);
  response.render("error");
});

initDb(
  function(err) {
    console.log("Error connecting to Mongo. Message:\n" + err);
  },
  app,
  mongoURL,
  dbDetails,
  mongoURLLabel,
  mongoDatabase
);

app.listen(port, ip, () => {
  console.log(`Express server listening on ${ip}:${port}!`);
});

app.locals.db = db;
app.locals.dbDetails = dbDetails;

module.exports = app;

const express = require("express");

const lipsumRoute = require("./lipsum");
const titleRoute = require("./title");

const router = express.Router();

module.exports = () => {
  router.get("/", (request, response, next) => {
    var initDb = function(callback) {
      if (request.app.locals.mongoURL == null) return;

      var mongodb = require("mongodb");
      if (mongodb == null) return;

      mongodb.connect(request.app.locals.mongoURL, function(err, conn) {
        if (err) {
          callback(err);
          return;
        }

        db = conn;
        dbDetails.databaseName = db.databaseName;
        dbDetails.url = request.app.locals.mongoURLLabel;
        dbDetails.type = "MongoDB";

        console.log("Connected to MongoDB at: %s", request.app.locals.mongoURL);
      });
    };

    try {
      var db = null;
      var dbDetails = new Object();

      if (!db) {
        initDb(function(err) {});
      }
      if (db) {
        var col = db.collection("counts");
        // Create a document with request IP and current time of request
        col.insert({ ip: request.app.locals.ip, date: Date.now() });
        col.count(function(err, count) {
          if (err) {
            console.log("Error running count. Message:\n" + err);
          }
          response.render("pages/index", {
            pageTitle: "Welcome",
            pageCountMessage: count,
            dbInfo: dbDetails
          });
        });
      } else {
        response.render("pages/index", {
          pageTitle: "Welcome",
          pageCountMessage: null
        });
        console.log(request.app.locals.mongoURL);
      }

      router.get("/pagecount", function(request, response) {
        // try to initialize the db on every request if it's not already
        // initialized.
        if (!db) {
          initDb(function(err) {});
        }
        if (db) {
          db.collection("counts").count(function(err, count) {
            response.send("{ pageCount: " + count + "}");
          });
        } else {
          response.send("{ pageCount: -1 }");
        }
      });

      initDb(function(err) {
        console.log("Error connecting to Mongo. Message:\n" + err);
      });
    } catch (err) {
      return next(err);
    }
  });

  router.use("/lipsum", lipsumRoute());
  router.use("/title", titleRoute());

  return router;
};

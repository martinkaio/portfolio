const express = require("express");

const lipsumRoute = require("./lipsum");
const titleRoute = require("./title");

const router = express.Router();

module.exports = () => {
  router.get("/", (request, response, next) => {
    var initDb = function(callback) {
      if (request.app.locals.mongoURL == null) return;

      request.app.locals.mongodb = require("mongodb");
      if (request.app.locals.mongodb == null) return;

      request.app.locals.mongodb.connect(request.app.locals.mongoURL, function(
        err,
        client
      ) {
        if (err) {
          callback(err);
          return;
        }

        request.app.locals.db = client.db;
        request.app.locals.dbDetails.databaseName =
          request.app.locals.db.databaseName;
        request.app.locals.dbDetails.url = request.app.locals.mongoURLLabel;
        request.app.locals.dbDetails.type = "MongoDB";

        console.log("Connected to MongoDB at: %s", request.app.locals.mongoURL);
        if (!request.app.locals.db) {
          console.log("No DB");
        }
      });
    };

    try {
      if (!request.app.locals.db) {
        initDb(function(err) {});
      }
      if (request.app.locals.db) {
        var col = request.app.locals.db.collection("counts");
        // Create a document with request IP and current time of request
        col.insert({ ip: request.app.locals.ip, date: Date.now() });
        col.count(function(err, count) {
          if (err) {
            console.log("Error running count. Message:\n" + err);
          }
          response.render("pages/index", {
            pageTitle: "Welcome",
            pageCountMessage: count,
            dbInfo: request.app.locals.dbDetails
          });
        });
      } else {
        response.render("pages/index", {
          pageTitle: "Welcome",
          pageCountMessage: null
        });
      }

      router.get("/pagecount", function(request, response) {
        // try to initialize the db on every request if it's not already
        // initialized.
        if (!request.app.locals.db) {
          initDb(function(err) {});
        }
        if (request.app.locals.db) {
          request.app.locals.db
            .collection("counts")
            .count(function(err, count) {
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

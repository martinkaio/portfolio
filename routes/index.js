const express = require("express");

const lipsumRoute = require("./lipsum");
const titleRoute = require("./title");

const router = express.Router();

module.exports = () => {
  router.get("/", (request, response, next) => {
    const initDb = function(callback) {
      if (request.mongoURL == null) return;

      const mongodb = require("mongodb");
      if (mongodb == null) return;

      mongodb.connect(mongoURL, function(err, conn) {
        if (err) {
          callback(err);
          return;
        }

        db = conn;
        dbDetails.databaseName = db.databaseName;
        dbDetails.url = request.mongoURLLabel;
        dbDetails.type = "MongoDB";

        console.log("Connected to MongoDB at: %s", request.mongoURL);
      });
    };

    try {
      var db = request.db;
      if (!db) {
        initDb(function(err) {});
      }
      if (db) {
        var col = db.collection("counts");
        // Create a document with request IP and current time of request
        col.insert({ ip: request.ip, date: Date.now() });
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
      }

      app.get("/pagecount", function(req, res) {
        // try to initialize the db on every request if it's not already
        // initialized.
        if (!db) {
          initDb(function(err) {});
        }
        if (db) {
          db.collection("counts").count(function(err, count) {
            res.send("{ pageCount: " + count + "}");
          });
        } else {
          res.send("{ pageCount: -1 }");
        }
      });
    } catch (err) {
      return next(err);
    }
  });

  router.use("/lipsum", lipsumRoute());
  router.use("/title", titleRoute());

  return router;
};

const express = require("express");

const lipsumRoute = require("./lipsum");
const titleRoute = require("./title");
var initDb = require("../services/initDb");

const router = express.Router();

module.exports = () => {
  router.get("/", (request, response, next) => {
    try {
      request.session.pageCountMessage = null;

      request.session.visitorIp =
        request.headers["x-forwarded-for"] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        (request.connection.socket
          ? request.connection.socket.remoteAddress
          : null);

      if (!request.app.locals.db) {
        console.log("No DB");
        initDb(
          function(err) {},
          request.app,
          request.app.locals.mongoURL,
          request.app.locals.dbDetails,
          request.app.locals.mongoURLLabel,
          request.app.locals.mongoDatabase
        );
      }
      if (request.app.locals.db) {
        var col = request.app.locals.db.collection("counts");
        // Create a document with request IP and current time of request

        if (
          !col.find({
            ip: request.session.visitorIp
          })
        ) {
          col.insertOne({
            ip: request.session.visitorIp,
            date: Date.now(),
            visits: 1
          });
        } else if (
          !col.find({
            ip: request.session.visitorIp,
            date: { $gt: Date.now() - 900000 }
          })
        ) {
          col.updateOne(
            { ip: request.session.visitorIp },
            { $set: { date: Date.now() }, $inc: { visits: 1 } }
          );
        }

        col.aggregate(
          [
            {
              $group: { _id: null, total: { $sum: "$visits" } }
            }
          ],
          (err, result) => {
            try {
              count = JSON.parse(result)["total"];
              request.session.pageCountMessage = count;
              response.render("pages/index", {
                pageTitle: "Welcome",
                pageCountMessage: count
              });
            } catch (err) {
              console.log("Error running count. Message:\n" + err);
              return next(err);
            }
          }
        );
      } else {
        response.render("pages/index", {
          pageTitle: "Welcome",
          pageCountMessage: null
        });
      }
    } catch (err) {
      return next(err);
    }
  });

  router.get("/pagecount", function(request, response) {
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!request.app.locals.db) {
      initDb(
        function(err) {},
        request.app,
        request.app.locals.mongoURL,
        request.app.locals.dbDetails,
        request.app.locals.mongoURLLabel,
        request.app.locals.mongoDatabase
      );
    }
    if (request.app.locals.db) {
      request.app.locals.db
        .collection("counts")
        .countDocuments(function(err, count) {
          response.send("{ pageCount: " + count + "}");
        });
    } else {
      response.send("{ pageCount: -1 }");
    }
  });

  router.use("/lipsum", lipsumRoute());
  router.use("/title", titleRoute());

  return router;
};

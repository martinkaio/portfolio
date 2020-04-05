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
        var col = request.app.locals.db.collection("visitors");
        // Create a document with request IP and current time of request
        /*
        false
        console.log(
          "findIp " +
            !col
              .find({
                ip: "0.0.0.0"
              })
              .toArray()
        );
        false
        console.log(
          "!findIp " +
            !col
              .find({
                ip: "0.0.0.2"
              })
              .toArray()
        );
        false
        console.log(
          "findIp(t) " +
            !col
              .find({
                ip: "0.0.0.0",
                date: { $gt: Date.now() - 900000 }
              })
              .toArray()
        );
        */
        /* Works
        col.find().toArray((err, items) => {
          console.log(items);
        });*/

        col
          .find({
            ip: "0.0.0.0"
          })
          .toArray((err, items) => {
            console.log("findIp " + items);
            console.log(items[0].ip);
          });

        if (
          !col.find({
            ip: request.session.visitorIp
          })
        ) {
          console.log("no IP");
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
          console.log("nothing lately");
          col.updateOne(
            { ip: request.session.visitorIp },
            { $set: { date: Date.now() }, $inc: { visits: 1 } }
          );
        }

        try {
          console.log("aggregate");

          var visitCount = async () => {
            var result = await col
              .aggregate({
                $group: { _id: null, total: { $sum: "$visits" } }
              })
              .toArray((err, count) => {
                request.session.pageCountMessage = count.total;
                response.render("pages/index", {
                  pageTitle: "Welcome",
                  pageCountMessage: count.total
                });
                console.log(count);
              });
          };

          visitCount();
        } catch (err) {
          console.log("Error running count. Message:\n" + err);
          return next(err);
        }
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

  router.get("/pagecount", (request, response) => {
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!request.app.locals.db) {
      initDb(
        err => {},
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

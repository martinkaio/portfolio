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

        (async () => {
          if (
            (await col
              .find({
                ip: request.session.visitorIp
              })
              .limit(1)
              .count()) < 1
          ) {
            console.log("new IP");
            col.insertOne({
              ip: request.session.visitorIp,
              date: Date.now(),
              visits: 1
            });
          } else if (
            (await col
              .find({
                ip: request.session.visitorIp,
                date: { $gt: Date.now() - 900000 }
              })
              .limit(1)
              .count()) < 1
          ) {
            console.log("new visit");
            col.updateOne(
              { ip: request.session.visitorIp },
              { $set: { date: Date.now() }, $inc: { visits: 1 } }
            );
          }

          try {
            col
              .aggregate([
                {
                  $group: { _id: null, total: { $sum: "$visits" } }
                }
              ])
              .toArray(async (err, result) => {
                count = await result[0].total;
                request.session.pageCountMessage = count;
                response.render("pages/index", {
                  pageTitle: "Welcome",
                  pageCountMessage: count
                });
              });
          } catch (err) {
            console.log("Error running count. Message:\n" + err);
            return next(err);
          }
        })();
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

  router.use("/lipsum", lipsumRoute());
  router.use("/title", titleRoute());

  return router;
};

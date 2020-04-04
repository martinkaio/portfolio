const express = require("express");
var initDb = require("../services/initDb");

const router = express.Router();

module.exports = () => {
  router.get("/", (request, response, next) => {
    try {
      request.session.pageCountMessage = null;
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
          .collection("visitors")
          .countDocuments((err, count) => {
            response.render("pages/title", {
              pageTitle: "Title",
              pageCountMessage: count
            });
            request.session.pageCountMessage = count;
          });
      } else {
        response.render("pages/title", {
          pageTitle: "Title",
          pageCountMessage: null
        });
      }
    } catch (err) {
      return next(err);
    }
  });
  return router;
};

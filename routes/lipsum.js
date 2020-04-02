const express = require("express");

const router = express.Router();

module.exports = () => {
  router.get("/", (request, response, next) => {
    try {
      response.render("pages/lipsum", {
        pageTitle: "Lipsum",
        pageCountMessage: request.session.pageCountMessage
      });
    } catch (err) {
      return next(err);
    }
  });
  return router;
};

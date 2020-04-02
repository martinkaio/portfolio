const express = require("express");

const router = express.Router();

module.exports = () => {
  router.get("/", (request, response, next) => {
    try {
      response.locals.pageCountMessage = request.session.pageCountMessage;
      response.render("pages/lipsum", { pageTitle: "Lipsum" });
    } catch (err) {
      return next(err);
    }
  });
  return router;
};

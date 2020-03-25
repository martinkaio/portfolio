const express = require("express");

const router = express.Router();

module.exports = () => {
  router.get("/", (request, response, next) => {
    try {
      response.render("pages/title", { pageTitle: "Title" });
    } catch (err) {
      return next(err);
    }
  });
  return router;
};

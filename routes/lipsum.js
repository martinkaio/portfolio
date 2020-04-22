const express = require("express");

const router = express.Router();

module.exports = (params) => {
  const { projectService } = params;

  router.get("/", async (request, response, next) => {
    try {
      const pictures = await projectService.getAllPictures();
      response.render("pages/lipsum", {
        pageTitle: "Lipsum",
        pageCountMessage: request.session.pageCountMessage,
        pictures,
      });
    } catch (err) {
      return next(err);
    }
  });
  return router;
};

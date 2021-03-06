const express = require("express");

const lipsumRoute = require("./lipsum");
const titleRoute = require("./title");
const dalembertRoute = require("./dalembert");
const initDb = require("../services/initDb");
const checkVisitor = require("../services/checkVisitor");

const router = express.Router();

module.exports = (params) => {
  router.get("/", (request, response, next) => {
    try {
      request.session.pageCountMessage = null;

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
        const col = request.app.locals.db.collection("visitors");

        (async () => {
          try {
            await checkVisitor(col, request.session.visitorIp);
            col
              .aggregate([
                {
                  $group: { _id: null, total: { $sum: "$visits" } },
                },
              ])
              .toArray(async (err, result) => {
                count = await result[0].total;
                request.session.pageCountMessage = count;
                response.render("pages/index", {
                  pageTitle: "Welcome",
                  pageCountMessage: count,
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
          pageCountMessage: null,
        });
      }
    } catch (err) {
      return next(err);
    }
  });

  const { projectService } = params;
  router.get("/test", async (request, response, next) => {
    try {
      const pictures = await projectService.getAllPictures();
      response.render("pages/test", {
        pageTitle: "Test",
        pageCountMessage: request.session.pageCountMessage,
        pictures,
      });
    } catch (err) {
      return next(err);
    }
  });

  router.get("/projects/solar", async (request, response, next) => {
    try {
      const pictures = await projectService.getAllPictures();
      response.render("pages/projects/solar", {
        pageTitle: "Solar light",
        pageCountMessage: request.session.pageCountMessage,
        pictures,
      });
    } catch (err) {
      return next(err);
    }
  });

  router.use("/lipsum", lipsumRoute(params));
  router.use("/title", titleRoute());
  router.use("/dalembert", dalembertRoute());

  return router;
};

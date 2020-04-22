const express = require("express");
const spawn = require("child_process").spawn;

const router = express.Router();

module.exports = () => {
  router.get("/", (request, response, next) => {
    try {
      var dalembert = spawn("python", [
        "./services/dalembert.py",
        request.query.funds, // starting funds
        request.query.size, // (initial) wager size
        request.query.count, // wager count — number of wagers per sim
        request.query.sims, // number of simulations
      ]);

      dalembert.stdout.on("data", function(data) {
        response.send(data.toString());
      });
    } catch (err) {
      return next(err);
    }
  });

  return router;
};

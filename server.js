const express = require("express");
const path = require("path");
const cookieSession = require("cookie-session");
const createError = require("http-errors");
const routes = require("./routes");

const app = express();

const port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
const ip = (ip =
  process.env.IP || process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");

app.set("trust proxy", 1);

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"]
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.locals.siteName = "Martin Kaio";

app.use(express.static(path.join(__dirname, "./static")));

app.use("/", routes());

app.use((request, response, next) => {
  return next(createError(404, "File not found"));
});

app.use((err, request, response, next) => {
  response.locals.message = err.message;
  console.error(err);
  const status = err.status || 500;
  response.locals.status = status;
  response.status(status);
  response.render("error");
});

app.listen(port, ip, () => {
  console.log(`Express server listening on ${ip}:${port}!`);
});

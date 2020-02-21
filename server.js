const express = require("express");
const path = require("path");
const cookieSession = require("cookie-session");
const createError = require("http-errors");
const bodyParser = require("body-parser");

const app = express();

const port = 3000;

app.set("trust proxy", 1);

app.use(cookieSession({ name: "session" }));

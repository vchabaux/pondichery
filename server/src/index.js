const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { locales } = require("./middlewares");
const config = require("./config");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { createError } = require("./utils");
const { initTransport } = require("./config/mail");
require("./node-plugin/initialize");
const { iconManagerServer } = require("@owlabio/icon-manager/server");

const app = express();

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(locales);

app.use(
  session({
    secret: config.session.secret,
    saveUninitialized: false,
    resave: true,
    cookie: {
      maxAge: 24 * 7 * 60 * 60 * 1000,
    },
    store: MongoStore.create({ mongoUrl: config.database.url }),
  })
);

app.use(
  cors({
    origin: ['http://vchabaux.github.io', 'http://vchabaux.github.io'],  // Allow only this domain
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow credentials (cookies, Authorization headers)
  })
);


app.use(express.static(path.join(__dirname, "..", "public")));

app.use(
  `/${config.app.uploadLocation}`,
  express.static(path.join(__dirname, "..", config.app.uploadLocation))
);

app.use("/static", express.static(path.join(__dirname, "..", "static")));

app.use("/api2", require("./routes"));

iconManagerServer.initRouters(app); // let's get awesome icons !

app.use("/api2/*", (_, __, next) => {
  next(createError(404, "router::not-found"));
});

initTransport();

/**
 * Serve the build file
 */
app.use("*", (req, res, next) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.use((err, req, res, next) => {
  if (!res.headersSent) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something bad happened" });
  }
});

app.locals.name = config.app.name;

module.exports = app;

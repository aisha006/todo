const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require('body-parser');
const session = require("express-session");
const createError = require("http-errors");
const expressValidator = require('express-validator');

const app = express();
app.use(expressValidator());
app.use(session({
  secret : 'webslesson',
  resave : false,
  saveUninitialized : true,
  cookie: { maxAge: 600000 }
}));


// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

// parse application/json
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", require("./routes/index"));
// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", {message: err.message});
});


app.listen(8080, (err) => {
  if (err) {
    console.log(`Error: ${err}`);
  }
  console.log(`Yupp! Server is running on port 8080`);
});
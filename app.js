// var http = require('http');
// var fs = require('fs').promises;
// var express = require("express");
// var path = require("path");

// const PORT = 8080;


// var server = http.createServer(function (req, res) {
//     let url = req.url;
//     if(url.indexOf(".") == -1) {
//         url = "index.html";
//     }
//     fs.readFile(__dirname + "/"+ url)
//     .then(content => {
//         if(url.indexOf(".html") !== -1) {
//             res.setHeader("Content-Type", "text/html");
//         } else if(url.indexOf(".js") !== -1) {
//             res.setHeader("Content-Type", "text/javascript");
//         } else if(url.indexOf(".css") !== -1) {
//             res.setHeader("Content-Type", "text/css");
//         }
//         res.writeHead(200);
//         res.end(content);
//     }).catch(error => {
//         res.writeHead(404);
//         res.setHeader("Content-Type", "text/html");
//         res.write("<h1>File not Found</h1>");
//         res.end();
//     })
// });

// server.listen(PORT);

/*const app = express();

app.use(express.static(path.join(__dirname, '.')));

app.listen(PORT, function() {
    console.log('Listening on port ' + PORT);
})*/
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
  cookie: { maxAge: 60000 }
}));
app.use(bodyParser.urlencoded({ extended: true }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));



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
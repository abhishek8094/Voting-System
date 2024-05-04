const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");

const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src/html/login.html"));
});

app.get("/css/login.css", (req, res) => {
  res.sendFile(path.join(__dirname, "src/css/login.css"));
});

app.get('/assets/eth.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/assets/eth.jpg'))
});

app.get('/js/login.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/js/login.js'))
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/index.html'));
});

app.get('/css/index.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/index.css'))
});

app.get('/admin.html',  (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/admin.html'));
});


app.get('/css/admin.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/admin.css'))
});

//start the server
app.listen(8080, () => {
  console.log("Server listening on http://localhost:8080");
});

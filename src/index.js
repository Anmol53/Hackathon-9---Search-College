const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 8080;

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connections } = require("mongoose");
const { connection } = require("./connector");

let filterObj = {};

const filterMW = (req, res, next) => {
  if (!isNaN(req.query.minPackage)) {
    filterObj.minPackage = { $gt: parseInt(req.query.minPackage) };
  }
  if (!isNaN(req.query.maxFees)) {
    filterObj.maxFees = { $lt: parseInt(req.query.maxFees) };
  }
  if (req.query.name) {
    filterObj.name = { $regex: req.query.name, $options: "i" };
  }
  if (req.query.state) {
    filterObj.state = { $regex: req.query.state, $options: "i" };
  }
  if (req.query.city) {
    filterObj.city = { $regex: req.query.city, $options: "i" };
  }
  if (req.query.exam) {
    filterObj.exam = {
      $elemMatch: {
        $regex: `^${req.query.exam.replace(" ", "+")}$`,
        $options: "i",
      },
    };
  }
  if (req.query.course) {
    filterObj.course = { $regex: `^${req.query.course}$`, $options: "i" };
  }
  next();
};

app.get("/findColleges", filterMW, async (req, res) => {
  console.log(filterObj);
  await connection
    .aggregate()
    .match(filterObj)
    .exec((err, result) => {
      filterObj = {};
      res.send(result);
    });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 8080;

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connections } = require("mongoose");
const { connection } = require("./connector");

const filterMW = (req, res, next) => {
  req.query.minPackage = !isNaN(req.query.minPackage)
    ? parseInt(req.query.minPackage)
    : 0;
  req.query.maxFees = !isNaN(req.query.maxFees)
    ? parseInt(req.query.maxFees)
    : 5000;
  req.query.name = req.query.name ? req.query.name : "";
  req.query.state = req.query.state ? req.query.state : "";
  req.query.city = req.query.city ? req.query.city : "";
  req.query.isCourse = req.query.course ? true : false;
  req.query.isExam = req.query.exam ? true : false;
  req.query.exam = req.query.exam ? req.query.exam.replace(" ", "+") : "";
  next();
};

app.get("/findColleges", filterMW, async (req, res) => {
  console.log(req.query.exam);
  connection
    .aggregate()
    .addFields({ isCourse: req.query.isCourse, isExam: req.query.isExam })
    .match({
      $and: [
        { maxFees: { $lt: req.query.maxFees } },
        { minPackage: { $gt: req.query.minPackage } },
        { name: { $regex: req.query.name } },
        { city: { $regex: req.query.city } },
        { state: { $regex: req.query.state } },
        { $or: [{ isCourse: false }, { course: req.query.course }] },
        { $or: [{ isExam: false }, { exam: { $in: [req.query.exam] } }] },
      ],
    })
    .project({
      _id: 0,
      name: "$name",
      city: "$city",
      state: "$state",
      exam: "$exam",
      course: "$course",
      maxFees: "$maxFees",
      minPackage: "$minPackage",
    })
    .exec((err, result) => {
      res.send(result);
    });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;

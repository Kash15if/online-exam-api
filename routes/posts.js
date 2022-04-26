const express = require("express");
const router = express.Router();

let jwt = require("jsonwebtoken"); //import jwt
const pool = require("../models/dbCon"); //importing db-pool for query
const sql = require("mssql");
const { max } = require("pg/lib/defaults");

//update answer api
router.post("/updateanswer", async (req, res) => {
  const jwttoken = req.headers["x-access-token"];

  if (!jwttoken)
    return res
      .status(401)
      .send({ auth: false, message: "Authentication required." });

  const TokenArray = jwttoken.split(" ");
  const token = TokenArray[1];

  try {
    const verified = await jwt.verify(token, process.env.AUTHTOKEN);

    const users = jwt.decode(token);

    const data = req.body;
    const answers = data.answers;
    const user = users.user;

    // answer is an array of string or character here
    //answers format is [{qno: 1 , answer: 'A'}, ....]

    const delResponse = await pool
      .request()
      .input("userIn", sql.VarChar, user)
      .query(
        " DELETE FROM [OnlineExam].[dbo].[answers] where [user] = @userIn"
      );

    let queryString = `INSERT INTO [OnlineExam].[dbo].[answers] ([user] ,[qno] ,[answer]) values `;
    Object.keys(answers).forEach((qno) => {
      let tempQuery = "('" + user + "'," + qno + ",'" + answers[qno] + "'), ";
      queryString += tempQuery;
    });

    queryString = queryString.slice(0, -2);

    console.log(queryString);

    const out = await pool.request().query(queryString);

    res.status = 200;
    res.send({ res: "data updated succesfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ auth: false, message: "Failed to authenticate token." });
  }
});

//update timer api
router.post("/updatetimer", async (req, res) => {
  const jwttoken = req.headers["x-access-token"];

  if (!jwttoken)
    return res
      .status(401)
      .send({ auth: false, message: "Authentication required." });

  const TokenArray = jwttoken.split(" ");
  const token = TokenArray[1];

  try {
    const verified = await jwt.verify(token, process.env.AUTHTOKEN);

    const users = jwt.decode(token);

    const data = req.body;

    const timeleft = parseInt(data.timeleft);

    const user = users.user;

    const getTime = await pool
      .request()
      .input("userIn", sql.VarChar, user)
      .query(
        " select timeleft from  [OnlineExam].[dbo].[usertimer]  where [user] = @userIn"
      );

    if (getTime.recordset[0].timeleft < timeleft) {
      throw new Error("Server time dont match.");
    }

    const out = await pool
      .request()
      .input("timeLeftIn", sql.Int, timeleft)
      .input("userIn", sql.VarChar, user)
      .query(
        " update [OnlineExam].[dbo].[usertimer]  set [timeleft] = @timeLeftIn where [user] = @userIn"
      );

    res.status = 200;
    res.send({ result: "data updated succesfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ auth: false, message: "Failed to authenticate token." });
  }
});

//Check answers and return result
router.post("/getresult", async (req, res) => {
  const jwttoken = req.headers["x-access-token"];

  if (!jwttoken)
    return res
      .status(401)
      .send({ auth: false, message: "Authentication required." });

  const TokenArray = jwttoken.split(" ");
  const token = TokenArray[1];

  try {
    const verified = await jwt.verify(token, process.env.AUTHTOKEN);

    const users = jwt.decode(token);

    const department = req.body.department;

    // console.log(req.body);

    const _userAnswers = await pool
      .request()
      .input("userIn", sql.VarChar, users.user)
      .query(
        "SELECT [qno] ,[answer] FROM [OnlineExam].[dbo].[answers] where [user] = @userIn"
      );
    const userAnswersArray = _userAnswers.recordset; //getting data from response

    const _actualAnswers = await pool
      .request()
      .input("deptIn", sql.VarChar, department)
      .query(
        "SELECT  [qno] , [answer] FROM [OnlineExam].[dbo].[Questions]   where [department] = @deptIn order by [qno]"
      );

    const correctAnswersArray = _actualAnswers.recordset; //getting data from response

    //consverting array of object to object of object with id as key
    const CorretAnswerObjectWithId = {};
    correctAnswersArray.forEach((item) => {
      CorretAnswerObjectWithId[item.qno] = item.answer;
    });

    //declaring marks variable
    let marks = 0;
    const totalMarks = correctAnswersArray.length;
    //method for calculating marks
    userAnswersArray.forEach((element) => {
      const { qno, answer } = element;
      const correctAnswerOfQno = CorretAnswerObjectWithId[qno];
      if (
        answer &&
        correctAnswerOfQno &&
        answer.trim().toUpperCase() === correctAnswerOfQno.trim().toUpperCase()
      ) {
        marks++;
      }
    });

    res.status(200);
    res.send({ marks: marks, user: users.user, totalMarks: totalMarks });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ auth: false, message: "Failed to authenticate token." });
  }
});

module.exports = router;

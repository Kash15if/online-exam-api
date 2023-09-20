const express = require("express");
const router = express.Router();

let jwt = require("jsonwebtoken"); //import jwt
const pool = require("../../models/dbCon"); //importing db-pool for query
const sql = require("mssql");
const { max } = require("pg/lib/defaults");

const { verifyToken, generateToken } = require("../../services/jwtToken");

//update answer api
router.post("/updateanswer", verifyToken, async (req, res) => {
  try {
    const users = req.payLoad;

    const data = req.body;
    const answers = data.answers;
    const user = users.user;

    const delResponse = await pool
      .request()
      .input("userIn", sql.VarChar, user)
      .query(" DELETE FROM [dbo].[answers] where [user] = @userIn");

    let queryString = `INSERT INTO [dbo].[answers] ([user] ,[qno] ,[answer], [date]) values `;
    Object.keys(answers).forEach((qno) => {
      let tempQuery =
        "('" + user + "'," + qno + ",'" + answers[qno] + "' ,GETDATE() ), ";
      queryString += tempQuery;
    });

    queryString = queryString.slice(0, -2);

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
router.post("/updatetimer", verifyToken, async (req, res) => {
  try {
    const users = req.payLoad;

    const data = req.body;
    const timeleft = parseInt(data.timeleft);
    const user = users.user;
    const getTime = await pool
      .request()
      .input("userIn", sql.VarChar, user)
      .query(
        " select timeleft from  [dbo].[usertimer]  where [user] = @userIn"
      );

    if (getTime.recordset[0].timeleft < timeleft) {
      throw new Error("Server time dont match.");
    }

    const out = await pool
      .request()
      .input("timeLeftIn", sql.Int, timeleft)
      .input("userIn", sql.VarChar, user)
      .query(
        " update [dbo].[usertimer]  set [timeleft] = @timeLeftIn where [user] = @userIn"
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
router.post("/getresult", verifyToken, async (req, res) => {
  try {
    const users = req.payLoad;
    const department = req.body.department;

    const _userAnswers = await pool
      .request()
      .input("userIn", sql.VarChar, users.user)
      .query(
        "SELECT [qno] ,[answer] FROM [dbo].[answers] where [user] = @userIn"
      );
    const userAnswersArray = _userAnswers.recordset; //getting data from response

    const _actualAnswers = await pool
      .request()
      .input("deptIn", sql.VarChar, department)
      .query(
        "SELECT  [qno] , [answer] FROM [dbo].[Questions]   where [department] = @deptIn order by [qno]"
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

//Check answers and return result
router.post("/detectuseractivity", verifyToken, async (req, res) => {
  try {
    const users = req.payLoad;

    const _userAnswers = await pool
      .request()
      .input("userIn", sql.VarChar, users.user)
      .input("userName", sql.VarChar, req.body.userName)
      .query(
        "insert into [dbo].[rule_violation_detected] ([user] ,[name] ,[detectedTime]) values (@userIn, @userName, GETDATE())"
      );
    // const userAnswersArray = _userAnswers.recordset; //getting data from response

    // res.status(200);
    res.send("Rule violation Detected");
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ auth: false, message: "Failed to authenticate token." });
  }
});

module.exports = router;

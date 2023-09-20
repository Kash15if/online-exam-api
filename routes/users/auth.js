const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

var jwt = require("jsonwebtoken");

const sql = require("mssql");

//importing db-connection query
const pool = require("../../models/dbCon"); //importing db-pool for query

const { generateToken } = require("../../services/jwtToken");

// router.post("/register", async (req, res) => {
//   let user = req.body;
//   // console.log(user);
//   try {
//     let dbData = await pool.query(
//       "SELECT userid, email, password FROM public.users where email = $1;",
//       [user.email]
//     );
//     let foundUser = dbData.rows[0];

//     // console.log(foundUser);
//     // users.find((data) => req.body.email === data.email);

//     if (!foundUser) {
//       let hashPassword = await bcrypt.hash(req.body.password, 10);

//       let addUser = await pool.query(
//         "INSERT INTO public.users( userid, email, password) VALUES (uuid_generate_v4(), $1, $2);",
//         [user.email, hashPassword]
//       );

//       if (addUser.rowCount) {
//         let userEmail = foundUser.email;
//         let userId = foundUser.userid;
//         var token = jwt.sign({ userEmail, userId }, "shhhhh");

//         res.send(token);
//       }

//       res.send(user.email);
//     } else {
//       res.send("This user already exists, Please login with another email");
//     }
//   } catch {
//     res.send("Internal server error");
//   }
// });

router.post("/login", async (req, res) => {
  let userCreds = req.body.user;

  try {
    let dbData = await pool
      .request()
      .input("user1", sql.VarChar, userCreds.user)
      .query(
        "SELECT  [user] , [pass] , [totaltime] , [department] , [name] ,[set] FROM  [dbo].[users] where [user] = @user1"
      );

    let foundUser = dbData.recordset[0];

    if (foundUser) {
      let submittedPass = userCreds.password;
      let storedPass = foundUser.pass;

      // const passwordMatch = await bcrypt.compare(submittedPass, storedPass);

      if (submittedPass === storedPass) {
        let user = foundUser.user;
        let name = foundUser.name;
        let department = foundUser.department;
        var token = generateToken({ user: user });

        res.status(200);
        res.send({
          auth: true,
          token: token,
          user: user,
          name: name,
          department: department,
          totaltime: foundUser.totaltime,
          set: foundUser.set,
        });
      } else {
        res.status(404);
        res.send("Wrong Password, Type correct password and login again");
      }
    } else {
      // let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
      // await bcrypt.compare(req.body.password, fakePass);

      res.status(404);
      res.send("No Such user exists");
    }
  } catch (error) {
    console.log(error);
    res.status(405);
    res.send("Internal server error");
  }
});

module.exports = router;

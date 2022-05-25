const express = require("express");
const router = express.Router();
const mysql = require("mysql");

const config = require("../config/config");

// 查询学生信息接口 /api/stu/stuinfo
router.get("/stuinfo", (req, res) => {
  const params = req.query;
  console.log(params);
  //连接数据库
  const db = mysql.createPool(config);
  //查询学生表信息
  const sql = `SELECT id,stuname,code,gender,class,major,school,email,state FROM students`;
  console.log(sql);
  db.query(sql, (err, results) => {
    if (err) return console.log(err.message);
    if (results.length) {
      results.map((item) => {
        item.gender = item.gender === 1 ? "男" : "女";
        item.state = item.state === 1 ? "有效" : "无效";
      });
      return res.send({
        state: 1, //查询成功
        message: "查询成功",
        data: results,
      });
    } else {
      res.send({
        state: 0, //查询失败
        message: "查询失败",
        data: results,
      });
    }
  });
});

// 重置学生密码接口 /api/stu/resetpassword
router.post("/resetpassword", (req, res) => {
  const params = req.body;

  // 如果用户勾选的全部都是禁用的用户
  if (!params.stuIds.length) {
    return res.send({
      state: 0,
      message: "全部是禁用用户，无法重置密码！",
    });
  }

  // 重置密码为123
  let when = ``;
  let price = "";
  params.stuIds.forEach((item, index) => {
    when += `WHEN ? THEN "202cb962ac59075b964b07152d234b70" `;
    price += "?,";
    if (index === params.stuIds.length - 1) {
      price = price.split("");
      price.pop();
      price = price.join("");
    }
  });
  const sql = `UPDATE students SET 
        password = CASE id ${when}
        END WHERE id IN (${price});`;
  // console.log(when,price);
  //连接数据库
  const db = mysql.createPool(config);

  db.query(sql, [...params.stuIds, ...params.stuIds], (err, results) => {
    if (err) return console.log(err.message);
    console.log(results);
    if (results.affectedRows) {
      return res.send({
        state: 1, //重置密码成功
        message: "重置密码成功",
      });
    } else {
      res.send({
        state: 0,
        message: "重置密码失败",
      });
    }
  });
});

// 学生结课/激活接口 /api/stu/statestu
router.post("/statestu", (req, res) => {
  const params = req.body;
  console.log(params);
//   如果前台传递的数据为空
  if(!params.stuIds.length){
      return res.send({
          state: 0,
          message: "全部是结课/激活用户，无法二次结课/激活！"
      })
  }
  // 勾选多个，能同时结课/激活
  let when = ``;
  let price = "";
  params.stuIds.forEach((item, index) => {
    when += `WHEN ? THEN ${params.state} `;
    price += "?,";
    if (index === params.stuIds.length - 1) {
      price = price.split("");
      price.pop();
      price = price.join("");
    }
  });
  const sql = `UPDATE students SET  
        state = CASE id ${when}
        END WHERE id IN (${price});`;

  console.log(when, price);

  // 连接数据库,更改学生状态
  const db = mysql.createPool(config);
  console.log(sql);
  db.query(sql, [...params.stuIds, ...params.stuIds], (err, results) => {
    if (err) return console.log(err.message);
    console.log(results);
    if (results.affectedRows) {
      if (params.state === 1) {
        res.send({
          state: 1,
          message: "激活成功",
        });
      } else {
        res.send({
          state: 1,
          message: "结课成功",
        });
      }
    } else {
      res.send({
        state: 0,
        message: "结课/激活失败",
      });
    }
  });
});
// router.post("/statestu", (req,res) => {
//     const params = req.body;
//     // 重置密码为123
//     let when = ``;
//     let price = "";
//     params.stuIds.forEach((item,index) => {
//         when += `WHEN ? THEN  `;
//         price += "?,";
//         if(index === params.stuIds.length - 1){
//             price = price.split("")
//             price.pop();
//             price = price.join("");
//         }
//     })
//     const sql = `UPDATE students SET
//         state = CASE id ${when}
//         END WHERE id IN (${price});`;
//     // console.log(when,price);
//     //连接数据库
//     const db = mysql.createPool(config)

//     db.query(sql,[...params.stuIds, ...params.stuIds], (err,results) =>{
//         if(err) return console.log(err.message);
//         console.log(results)
//         if(results.affectedRows){
//             return res.send({
//                 state: 1,  //重置密码成功
//                 message: "重置密码成功",
//             })
//         }else{
//             res.send({
//                 state: 0,
//                 message: "重置密码失败",
//             })
//         }

//     })

//    })

module.exports = router;

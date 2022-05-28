const express = require("express");
const router = express.Router();
const mysql = require("mysql");

const config = require("../config/config");
const Query = require("mysql/lib/protocol/sequences/Query");
const uuid = require("uuid")


// 获取学生信息接口 /api/stu/stuinfo
// 模糊查询学生信息复用
router.get("/stuinfo", (req, res) => {
  // 连接数据库
  const db = mysql.createPool(config);
  const query = req.query;
  // 定义模糊查询条件
  let condition = "";
  // 判断是否含有参数
  if (Object.keys(query).length) {
    condition += "where ";
  }
  // 判断并添加模糊搜索条件
  if (query.stuState && query.stuState != "2") {
    condition += `state = ${query.stuState} AND `;
  }
  if (query.major) {
    condition += `major = "${query.major}" AND `;
  }
  if (query.input) {
    condition += `stuname LIKE "%${query.input}%" AND `;
  }
  // 将拼接的条件后的 “AND ” 删除
  condition = condition.split(" ");
  condition.splice(condition.length - 2);
  condition = condition.join(" ");

  //查询学生表信息
  const sql = `SELECT id,stuname,code,gender,stuclass,major,school,email,state FROM students ${condition} ORDER BY ts DESC LIMIT ${(query.pageNum-1)*query.pageSize}, ${query.pageSize};`;

  console.log(sql);
  db.query(sql, (err, results) => {
    if (err) return console.log(err.message);
    if (results.length) {
      results.map((item) => {
        item.gender = item.gender === 1 ? "男" : "女";
        item.state = item.state === 1 ? "有效" : "无效";
      });
      const sql = `SELECT COUNT(id) AS total FROM students ${condition}`;
      let total;
      db.query(sql, (err, results1) => {
        console.log(results1[0].total);
        console.log(total);
        total = results1[0].total;

        return res.send({
          state: 1, //查询成功
          message: "查询成功",
          data: {
            results,
            total,
          },
        });
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
  if (!params.stuIds.length) {
    return res.send({
      state: 0,
      message: "全部是结课/激活用户，无法二次结课/激活！",
    });
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

// 新增学生接口 /api/stu/addstu
router.post("/addstu", (req, res) => {
  const params = req.body;
  console.log(params);
  // 连接数据库
  const db = mysql.createPool(config);

  params.id = uuid.v1().replaceAll("-","")

  const sql = `insert into students(id,code,stuname,gender,email,phone,indent,school,major,stuclass,state,password) values('${params.id}','${params.code}','${params.stuname}','${params.gender}','${params.email}','${params.phone}','${params.indent}','${params.school}','${params.major}','${params.stuclass}','1','e10adc3949ba59abbe56e057f20f883e');`
  console.log(sql);
  db.query(sql,(err, results) => {
    if (err) return console.log(err.message);
    console.log(results);
    if (results.affectedRows) {
      return res.send({
        state: 1, 
        message: "新增学生成功",
      });
    } else {
      res.send({
        state: 0,
        message: "新增学生失败",
      });
    }
  });
});

module.exports = router;

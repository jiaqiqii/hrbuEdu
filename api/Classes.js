const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const config = require("../config/config");
const dayjs = require("dayjs");
const uuid = require("uuid");


// 格式化时间
const FormatTime = (ts) => {
    return dayjs(ts).format("YYYY-MM-DD HH:mm:ss");
  }
  

// 获取班级信息接口 /api/class/classinfo
// 模糊查询复用
router.get("/classinfo", (req, res) => {
  const query = req.query;
  console.log(query);
  //连接数据库
  const db = mysql.createPool(config);
  // 定义模糊查询条件
  let condition = "";
  // 判断是否含有条件参数
  if(Object.keys(query).length) {
    condition += "where "
  }
  // 添加模糊搜索条件
  if(query.major && query.major != "全部"){
    condition += `major = "${query.major}" AND `;
  }
  if(query.classState && query.classState !=2){
    condition += `state = ${query.classState} AND `;
  }
  if(query.input){
    condition += `classname LIKE "%${query.input}%" AND `;
  }
  // 删除条件最后一个"AND "
  condition = condition.split(" ");
  condition.splice(condition.length - 2);
  condition = condition.join(" ");

  //查询班级表
  // const sql = `select id,classname,school,major,state,ts from class ${condition} LIMIT ${(query.pageNum - 1) * query.pageSize},${query.pageSize};`;
  const sql = `select id,classname,school,major,state,ts from class ${condition} LIMIT ${(query.pageNum - 1) * query.pageSize},${query.pageSize};`;

  console.log(sql);
  db.query(sql, (err, results) => {
    if (err) return console.log(err.message);
    if (results.length) {
        results.map((item) => {
            item.ts = FormatTime(item.ts);
            item.state = item.state === 1 ? "有效" : "无效";
          });

      const sql = `SELECT COUNT(id) as total FROM class ${condition};`;
      let total;
      db.query(sql,(error,results1) => {
        console.log(results1[0].total);
        console.log(total);
        total = results1[0].total
        return res.send({
          state: 1, //查询成功
          message: "查询成功",
          data:{
            results,
            total
          },
        });
        
      })
    } else {
      res.send({
        state: 0, //查询失败
        message: "查询失败",
      });
    }
  });
});

// 查询学生人数 /api/class/stunum
router.get("/stunum", (req, res) => {
  // 连接数据库
  const db = mysql.createPool(config);

  const query = req.query;
  console.log(query);
  
  // const sql = `SELECT COUNT(id) as stunum FROM students WHERE stuclass = "计算机201901";`;
  const sql = `SELECT COUNT(id) as stunum FROM students WHERE stuclass = "${query.classname}" and school = "${query.school}";`;
  console.log(sql);
  let stunum;
  db.query(sql, (err, results) => {
    if (err) return console.log(err.message);
    if (results.length) {
      // console.log(results[0].stunum);
      // stunum = results[0].stunum
      return res.send({
        state: 1,
        message: "查询成功",
        data:{
          results,
          stunum
        }
      });
    } else {
      res.send({
        state: 0,
        message: "查询失败",
      });
    }
  });
});

// 班级结课/激活接口 /api/class/stateclass
router.post("/stateclass", (req, res) => {
    const params = req.body;
    console.log(params);
    //   如果前台传递的数据为空
    if (!params.classIds.length) {
      return res.send({
        state: 0,
        message: "全部是结课/激活用户，无法二次结课/激活！",
      });
    }
    // 勾选多个，能同时结课/激活
    let when = ``;
    let price = "";
    params.classIds.forEach((item, index) => {
      when += `WHEN ? THEN ${params.state} `;
      price += "?,";
      if (index === params.classIds.length - 1) {
        price = price.split("");
        price.pop();
        price = price.join("");
      }
    });
    const sql = `UPDATE class SET  
          state = CASE id ${when}
          END WHERE id IN (${price});`;
  
    console.log("when,price",when, price);
  
    // 连接数据库,更改班级状态
    const db = mysql.createPool(config);
    console.log(sql);
    db.query(sql, [...params.classIds, ...params.classIds], (err, results) => {
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

// 新增班级接口 /api/class/addclass
router.post("/addclass", (req, res) => {
  const params = req.body;
  // 连接数据库
  const db = mysql.createPool(config);
//  if(){

//  } 

  params.id = uuid.v1().replaceAll("-", "");

  const sql = `insert into class(id,classname,school,major,state,level) values('${params.id}','${params.classname}','${params.school}','${params.major}','1','${params.level}');`;
  console.log(sql)
  db.query(sql, (err, results) => {
    if (err) return console.log(err.message);
    console.log(results);
    if (results.affectedRows) {
      return res.send({
        state: 1,
        message: "新增班级成功",
      });
    } else {
      res.send({
        state: 0,
        message: "新增班级失败",
      });
    }
  });
});

// 查询某个班级信息接口 /api/class/classcheck
router.get("/classcheck", (req, res) => {
  // 连接数据库
  const db = mysql.createPool(config);

  const query = req.query;
  // console.log(query);
  
  //查询某个班级信息
  const sql = `SELECT * FROM class WHERE id = "${query.id}";`;
  // console.log(sql);

  db.query(sql, (err, results) => {
    if (err) return console.log(err.message);
    if (results.length) {
        results.map((item) => {
          item.ts = FormatTime(item.ts);
          item.state = item.state === 1 ? "有效" : "无效";        
        });
      return res.send({
        state: 1,
        message: "查询班级信息成功",
        data:{
          results,
        }
      });
    } else {
      res.send({
        state: 0,
        message: "查询班级信息失败",
        data:{
          results,
        }
      });
    }
  });
});

// 编辑班级信息 /api/class/editclass
router.post("/editclass", (req, res) => {
  const params = req.body;
  // 连接数据库
  const db = mysql.createPool(config);

  const sql = `UPDATE class SET major="${params.major}" ,classname = "${params.classname}" WHERE id ="${params.id}"`;
  console.log(sql)
  db.query(sql, (err, results) => {
    if (err) return console.log(err.message);
    console.log(results);
    if (results.affectedRows) {
      return res.send({
        state: 1,
        message: "编辑班级成功",
      });
    } else {
      res.send({
        state: 0,
        message: "编辑班级失败",
      });
    }
  });
});

module.exports = router;

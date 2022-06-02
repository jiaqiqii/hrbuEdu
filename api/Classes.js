const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const config = require("../config/config");
const dayjs = require("dayjs");


// 格式化时间
const FormatTime = (ts) => {
    return dayjs(ts).format("YYYY-MM-DD HH:mm:ss");
  }
  

// 获取班级信息接口 /api/class/classinfo
router.get("/classinfo", (req, res) => {
  const query = req.query;
  console.log(query);
  //连接数据库，匹配用户名与密码
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
  const sql = `select id,classname,school,major,state from class ${condition} LIMIT ${(query.pageNum - 1) * query.pageSize},${query.pageSize};`;
  console.log(sql);
  db.query(sql, (err, results) => {
    if (err) return console.log(err.message);
    if (results.length) {
        results.map((item) => {
            item.ts = FormatTime(item.ts);
            item.state = item.state === 1 ? "有效" : "无效";
          });

      const sql = `SELECT COUNT(id) as total FROM class;`;
      let total;
      db.query(sql,(error,results1) => {
        console.log(results1[0].total);
        console.log(total);
        total = results1[0].total
        res.send({
          state: 1, //查询成功
          message: "查询成功",
          data:{
            results,
            total
          }
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



module.exports = router;

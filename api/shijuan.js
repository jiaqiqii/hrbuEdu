const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const config = require("../config/config")

// 新增教师接口 /api/teacher/addteach
router.post("/addteach", (req, res) => {
    const params = req.body;
    console.log("params",params)
    // 连接数据库
    const db = mysql.createPool(config);
  
    params.id = uuid.v1().replaceAll("-", "");
  
    const sql = `insert into textpaper(name,fenlei,xingshi,jianjie) 
    values('${params.name}','${params.fenlei}','${params.xingshi}','${params.jianjie}','1','e10adc3949ba59abbe56e057f20f883e');`;
    console.log(sql)
    db.query(sql, (err, results) => {
      if (err) return console.log(err.message);
      console.log(results);
      if (results.affectedRows) {
        return res.send({
          state: 1,
          message: "新增教师成功",
        });
      } else {
        res.send({
          state: 0,
          message: "新增教师失败",
        });
      }
    });
  });



module.exports = router
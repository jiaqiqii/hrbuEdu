const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const config = require("../config/config")

router.post("/addteach", (req, res) => {
    const params = req.body;
    console.log("params",params)
    // 连接数据库
    const db = mysql.createPool(config);
  
  
    const sql = `insert into textpaper(name,fenlei,xingshi,jianjie,fangxiang,jineng) 
    values('${params.name}','${params.fenlei}','${params.xingshi}','${params.jianjie}','${params.fangxiang}','${params.jineng}');`;
    console.log(sql)
    db.query(sql, (err, results) => {
      if (err) return console.log(err.message);
      console.log(results);
      if (results.affectedRows) {
        return res.send({
          state: 1,
          message: "保存成功",
        });
      } else {
        res.send({
          state: 0,
          message: "保存失败",
        });
      }
    });
  });



module.exports = router
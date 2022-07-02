const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const config = require("../config/config");
const dayjs = require("dayjs");
// const uuid = require("uuid");

// 格式化时间
const FormatTime = (ts) => {
    return dayjs(ts).format("YYYY-MM-DD HH:mm:ss");
  }
  
// 新增课件接口 /api/class/addclass
router.post("/newcourseware", (req, res) => {
  const params = req.body;
  // 连接数据库
  const db = mysql.createPool(config);

  // params.id = uuid.v1().replaceAll("-", "");

  const sql = `insert into courseware(courseware_type) values('${params.courseware_type}');`;
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


module.exports = router;

const express = require("express");
const router = express.Router();
const mysql = require("mysql");



const config = require("../config/config");



// 获取用户信息 /api/knowledge/knowledgeinfo
router.get("/knowledgeinfo", (req, res) => {

    const params = req.query;
    console.log(params);
    // 连接数据库，匹配用户名与密码
    const db = mysql.createPool(config)

    const query = req.query;
    let condition = "";
    // 判断是否含有参数
    if(Object.keys(query).length){
        condition += "where ";
    }
    
    // 将拼接的条件后的 “AND ” 删除
    condition =  condition.split(" ")
    condition.splice(condition.length-2,);
    condition = condition.join(" ");
    // 查询用户表
    const sql = `SELECT id ,knowledge_name,knowledge_directory FROM knowledge; `;
    console.log(sql);
    db.query(sql, (err, results) => {
        if(err) return console.log(err.message);
        if(results.length){
            
            
              const sql = `SELECT COUNT(id) AS total FROM knowledge ${condition}`;
              let total;
              db.query(sql, (err, results1) => {
                  console.log(results1[0].total);
                  console.log(total);
                  total = results1[0].total
                  res.send({
                      state: 1, // 查询成功
                      message: "查询成功",
                      data: {
                          results,
                          total
                      }
                  })
              });
          } else {
              res.send({
                  state: 0, // 查询失败
                  message: "查询失败",
              })
          }
      })
  })
  





module.exports = router
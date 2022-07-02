const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const config = require("../config/config")
router.get("/coursewareinfo", (req,res) => {
    
    const db = mysql.createPool(config)

    const query = req.query;


//     // 定义模糊查询条件
  let condition = "";
//   判断是否含有条件参数
  if(Object.keys(query).length) {
    condition += "where ";  }
//   添加模糊搜索条件
  if(query.cwstate && query.cwstate != "1"){
    condition += `courseware_state = ${query.cwstate} AND `;
  }
  if(query.cwdifficulty && query.cwdifficulty !="1"){
    condition += `courseware_difficulty = ${query.cwdifficulty} AND `;
  }
  if(query.searchinput){
    condition += `courseware_name LIKE "%${query.searchinput}%" AND `;
  }
  console.log(condition);
  // 删除条件最后一个"AND "
  condition = condition.split(" ");
  condition.splice(condition.length - 2);
  condition = condition.join(" ");
    //查询用户表
    // const sql = `select courseware_id,courseware_name,courseware_type,courseware_length,subject_id,courseware_creater,courseware_difficulty,courseware_state,courseware_time from courseware ${condition}  ORDER BY courseware_time DESC;`;
    const sql = `select courseware_id,courseware_name,courseware_type,courseware_length,subject_id,courseware_creater,courseware_difficulty,courseware_state,courseware_time from courseware ${condition}  ORDER BY courseware_time DESC;`;
    console.log(sql);
   
    db.query(sql, (err,results) =>{
        if(err) return console.log(err.message);
        if(results.length){
             res.send({
                state: 1,  //查询成功
                message: "查询成功",
                data: results
            })
        }else{
            res.send({
                state: 0,  //查询失败
                message: "查询失败",
                
            })
        }
    
 })
    
})


module.exports = router
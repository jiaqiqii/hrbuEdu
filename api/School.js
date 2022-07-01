const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const dayjs = require("dayjs");
const uuid = require("uuid");

const config = require("../config/config");

const FormatTime = (ts) => {
    return dayjs(ts).format("YYYY-MM-DD HH:mm:ss");
}

// 获取用户信息 /api/school/schoolinfo
router.get("/schoolinfo", (req, res) => {

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
    // 参数中包含用户状态
    if(query.schoolState && query.schoolState != "2"){
        condition += `state = ${query.schoolState} AND `;
    }
    if(query.startTime){
        condition += `ts BETWEEN "${query.startTime}" AND "${query.endTime}" AND `;
    }
    if(query.searchInput){
        condition += `sc_name LIKE "%${query.searchInput}%" AND `;
    }
    // 将拼接的条件后的 “AND ” 删除
    condition =  condition.split(" ")
    condition.splice(condition.length-2,);
    condition = condition.join(" ");


    // 查询用户表
    const sql = `SELECT  id,schoolname,sc_position,state,ts FROM schools  ${condition}  ORDER BY ts DESC LIMIT ${(query.pageNum-1)*query.pageSize}, ${query.pageSize}; `;
    console.log(sql);
    db.query(sql, (err, results) => {
        if(err) return console.log(err.message);
        if(results.length){
            //对数据进行加工
            results.map((item)=>{
                item.ts = FormatTime(item.ts);
                item.state= item.state === "1" ? "有效" : "禁用";
      
              })


            const sql = `SELECT COUNT(id) AS total FROM schools ${condition}`;
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


// 学校禁用/激活接口
router.post("/disableOrActivatedSchool", (req, res) => {
    const params = req.body;
    console.log(params);
    // 如果前台传递的数据为空
    if(!params.schoolIds.length){
        return res.send({  
            state: 0,
            message: "全部是禁用/激活用户，无法二次禁用/激活！"
        })
    }
    
    
    // 勾选多个，能同时禁用/激活
    let when = ``;
    let price = ""
    params.schoolIds.forEach((item, index) => {
        when += `WHEN ? THEN ${params.state} `;
        price += "?,";
        if (index === params.schoolIds.length - 1) {
            price = price.split("")
            price.pop();
            price = price.join("");
        }
    })
    const sql = `UPDATE schools SET  
        state = CASE id ${when}
        END WHERE id IN (${price});`;

    console.log(when, price);

    // 连接数据库，匹配用户名与密码
    const db = mysql.createPool(config)
    console.log(sql);
    db.query(sql, [...params.schoolIds, ...params.schoolIds], (err, results) => {
        if (err) return console.log(err.message);
        console.log(results);
        if (results.affectedRows) {
            if(params.state === 1){
                res.send({
                    state: 1,
                    message: "激活成功"
                })
            } else{
                res.send({
                    state: 1,
                    message: "禁用成功"
                })
            }
        } else {
            res.send({
                state: 0,
                message: "禁用/激活失败"
            })
        }
    })
})

// 新增学校接口 /api/school/addschool
router.post("/addschool", (req, res) => {
    const params = req.body;
    // 连接数据库
    const db = mysql.createPool(config);
  
    params.id = uuid.v1().replaceAll("-", "");
  
    const sql = `insert into schools(id,schoolname,sc_position,state) values('${params.id}','${params.schoolname}','${params.sc_position}','1');`;
    console.log(sql)
    db.query(sql, (err, results) => {
      if (err) return console.log(err.message);
      console.log(results);
      if (results.affectedRows) {
        return res.send({
          state: 1,
          message: "新增学校成功",
        });
      } else {
        res.send({
          state: 0,
          message: "新增学校失败",
        });
      }
    });
  });

module.exports = router
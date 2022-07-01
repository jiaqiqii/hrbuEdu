const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const dayjs = require("dayjs");
const uuid = require("uuid");

const config = require("../config/config");
const Query = require("mysql/lib/protocol/sequences/Query");

// 格式化时间
const FormatTime = (ts) => {
    return dayjs(ts).format("YYYY-MM-DD HH:mm:ss");
}

// 获取用户信息 /api/user/userinfo
router.get("/userinfo", (req, res) => {
    // 连接数据库，匹配用户名与密码
    const db = mysql.createPool(config)

    const query = req.query;
    let condition = "";
    // 判断是否含有参数
    if(Object.keys(query).length){
        condition += "where ";
    }
    // 参数中包含用户状态
    if(query.userState && query.userState != "2"){
        condition += `state = ${query.userState} AND `;
    }
    if(query.startTime){
        condition += `ts BETWEEN "${query.startTime}" AND "${query.endTime}" AND `;
    }
    if(query.searchInput){
        condition += `username LIKE "%${query.searchInput}%" AND `;
    }
    // 将拼接的条件后的 “AND ” 删除
    condition =  condition.split(" ")
    condition.splice(condition.length-2,);
    condition = condition.join(" ");

 

    // 查询用户表
    const sql = `SELECT id, username,gender,email,state,ts FROM users ${condition} ORDER BY ts DESC LIMIT ${(query.pageNum-1)*query.pageSize}, ${query.pageSize};`;
    console.log(sql);
    db.query(sql, (err, results) => {
        if (err) return console.log(err.message);
        if (results.length) {
            // 对数据进行加工
            results.map((item) => {
                item.ts = FormatTime(item.ts);
                item.gender = item.gender === 1 ? "男" : "女";
                item.state = item.state === 1 ? "有效" : "禁用";
            })
            const sql = `SELECT COUNT(id) AS total FROM users ${condition}`;
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

// 重置用户密码接口
router.post("/resetpassword", (req, res) => {
    const params = req.body;

    // 如果用户勾选的全部都是禁用的用户
    if(!params.userIds.length){
        return res.send({
            state: 0,
            message: "全部是禁用用户，无法重置密码！"
        })
    }

    // 勾选多个，能同时更改密码
    let when = ``;
    let price = ""
    params.userIds.forEach((item, index) => {
        console.log("@@@@",item);
        when += `WHEN ? THEN "466bd066eaea252f4853611938852cfc" `;
        price += "?,";
        if (index === params.userIds.length - 1) {
            price = price.split("")
            price.pop();
            price = price.join("");
        }
    })
    // 重置密码为qwe
    const sql = `UPDATE users SET  
        PASSWORD = CASE id ${when}
        END WHERE id IN (${price});`;

    console.log(when, price);

    // 连接数据库，匹配用户名与密码
    const db = mysql.createPool(config)
    console.log(sql);
    db.query(sql, [...params.userIds, ...params.userIds], (err, results) => {
        if (err) return console.log(err.message);
        console.log(results);
        if (results.affectedRows) {
            // 邮箱验证
            const Mail = require("../public/Mail");
            // console.log(Mail);
            console.log(params.emailList.join(","));
            // 只发送一个邮箱
            // Mail("592882165@qq.com")
            // 发送多个邮箱
            Mail(params.emailList.join(","))

            res.send({
                state: 1,
                message: "重置密码成功"
            })
        } else {
            res.send({
                state: 0,
                message: "重置密码失败"
            })
        }
    })
})

// 用户禁用/激活接口
router.post("/disableOrActivatedUser", (req, res) => {
    const params = req.body;
    console.log(params);
    // 如果前台传递的数据为空
    if(!params.userIds.length){
        return res.send({
            state: 0,
            message: "全部是禁用/激活用户，无法二次禁用/激活！"
        })
    }
    
    
    // 勾选多个，能同时禁用/激活
    let when = ``;
    let price = ""
    params.userIds.forEach((item, index) => {
        when += `WHEN ? THEN ${params.state} `;
        price += "?,";
        if (index === params.userIds.length - 1) {
            price = price.split("")
            price.pop();
            price = price.join("");
        }
    })
    const sql = `UPDATE users SET  
        state = CASE id ${when}
        END WHERE id IN (${price});`;

    console.log(when, price);

    // 连接数据库，匹配用户名与密码
    const db = mysql.createPool(config)
    console.log(sql);
    db.query(sql, [...params.userIds, ...params.userIds], (err, results) => {
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

// 新增用户接口 /api/user/adduser
router.post("/adduser", (req, res) => {
    const params = req.body;
    // 连接数据库
    const db = mysql.createPool(config);
  
    params.id = uuid.v1().replaceAll("-", "");
  
    const sql = `insert into users(id,username,password,teachname,gender,school,major,position,email,phone,state) values('${params.id}','${params.username}','${params.password}','${params.teachname}','${params.gender}','${params.email}','${params.phone}','1');`;
    console.log(sql)
    db.query(sql, (err, results) => {
      if (err) return console.log(err.message);
      console.log(results);
      if (results.affectedRows) {
        return res.send({
          state: 1,
          message: "新增用户成功",
        });
      } else {
        res.send({
          state: 0,
          message: "新增用户失败",
        });
      }
    });
  });


  // 获取用户信息 /api/user/onlineuserinfo
router.get("/onlineuserinfo", (req, res) => {
    // 连接数据库，匹配用户名与密码
    const db = mysql.createPool(config)
    const query = req.query;
    let condition = "";
    // 判断是否含有参数
    if(Object.keys(query).length){
        condition += "where ";
    }
    // 参数中包含用户状态
    if(query.onlineuserState && query.onlineuserState != "2"){
        condition += `state = ${query.onlineuserState} AND `;
    }
    if(query.searchInput){
        condition += `username LIKE "%${query.searchInput}%" AND `;
    }
    // 将拼接的条件后的 “AND ” 删除
    condition =  condition.split(" ")
    condition.splice(condition.length-2,);
    condition = condition.join(" ");

 

    // 查询用户表
    const sql = `select id,username,teachname,school,major,position ,state,onlinestate from users ${condition} where onlinestate="1";`;
    // const sql = `SELECT id, username,gender,email,state,ts FROM users  ORDER BY ts DESC LIMIT  `;
    console.log(sql);
    db.query(sql, (err, results) => {
        if (err) return console.log(err.message);
        if (results.length) {
            // 对数据进行加工
            results.map((item) => {
                item.onlinestate = item.onlinestate === 1 ? "有效" : "禁用";
            })
            const sql = `SELECT COUNT(id) AS total FROM users ${condition}`;
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
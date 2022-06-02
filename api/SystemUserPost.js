const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const config = require("../config/config")

router.post("/login", (req,res) => {
    const params = req.body;
    console.log(params);
    //连接数据库，匹配用户名与密码
    const db = mysql.createPool(config)
    //查询用户表
    const sql = `select username from users where username='${params.username}' and password='${params.password}';`;
    console.log(sql);
    db.query(sql, (err,results) =>{
        if(err) return console.log(err.message);
        if(results.length){
            return res.send({
                state: 1,  //管理员登录
                message: "登录成功"
            })
        }else{
            //查询学生表
            const sql1 = `select id from students where stuname='${params.username}' and password='${params.password}';`;
            console.log(sql1);
            db.query(sql1, (err,results) =>{
                if(err) return console.log(err.message);
                if(results.length){
                return res.send({
                state: 2,  //学生端登录
                message: "登录成功"
            })
        }else{
            return res.send({
                state: 0,  //学生端登录
                message: "登录失败"
            })
        }
    })
        
   }
 })
    
})


module.exports = router
const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const dayjs = require("dayjs");


const config = require("../config/config");

const FormatTime = (ts) => {
    return dayjs(ts).format("YYYY-MM-DD HH:mm:ss");
}


// 获取角色信息 /api/role/roleinfo
router.get("/roleinfo", (req, res) => {

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
    if(query.roleState && query.roleState != "2"){
        condition += `state = ${query.roleState} AND `;
    }
    if(query.startTime){
        condition += `ts BETWEEN "${query.startTime}" AND "${query.endTime}" AND `;
    }
    if(query.searchInput){
        condition += `rolename LIKE "%${query.searchInput}%" AND `;
    }
    // 将拼接的条件后的 “AND ” 删除
    condition =  condition.split(" ")
    condition.splice(condition.length-2,);
    condition = condition.join(" ");
    // 查询用户表
    const sql = `SELECT  id,rolename,miaoshu,academy,state,ts FROM roles  ${condition} ORDER BY ts DESC LIMIT ${(query.pageNum-1)*query.pageSize}, ${query.pageSize}; `;
    console.log(sql);
    db.query(sql, (err, results) => {
        if(err) return console.log(err.message);
        if(results.length){
            //对数据进行加工
            results.map((item)=>{
                item.ts = FormatTime(item.ts);
                item.state = item.state === "1" ? "有效" : "禁用";

      
              })

              const sql = `SELECT COUNT(id) AS total FROM roles ${condition}`;
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

// 角色禁用/激活接口
router.post("/disableOrActivatedRole", (req, res) => {
    const params = req.body;
    console.log(params);
    // 如果前台传递的数据为空
    if(!params.roleIds.length){
        return res.send({
            state: 0,
            message: "全部是禁用/激活用户，无法二次禁用/激活！"
        })
    }
    
    
    // 勾选多个，能同时禁用/激活
    let when = ``;
    let price = ""
    params.roleIds.forEach((item, index) => {
        when += `WHEN ? THEN ${params.state} `;
        price += "?,";
        if (index === params.roleIds.length - 1) {
            price = price.split("")
            price.pop();
            price = price.join("");
        }
    })
    const sql = `UPDATE roles SET  
        state = CASE id ${when}
        END WHERE id IN (${price});`;

    console.log(when, price);

    // 连接数据库，匹配用户名与密码
    const db = mysql.createPool(config)
    console.log(sql);
    db.query(sql, [...params.roleIds, ...params.roleIds], (err, results) => {
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

// 新增角色接口 /api/role/addrole
router.post("/addrole", (req, res) => {
    const params = req.body;
    // 连接数据库
    const db = mysql.createPool(config);
  
    params.id = uuid.v1().replaceAll("-", "");
  
    const sql = `insert into roles(id,rolename,academy,miaoshu,state) values('${params.id}','${params.rolename}','${params.academy}','${params.miaoshu}','1');`;
    console.log(sql)
    db.query(sql, (err, results) => {
      if (err) return console.log(err.message);
      console.log(results);
      if (results.affectedRows) {
        return res.send({
          state: 1,
          message: "新增角色成功",
        });
      } else {
        res.send({
          state: 0,
          message: "新增角色失败",
        });
      }
    });
  });

module.exports = router
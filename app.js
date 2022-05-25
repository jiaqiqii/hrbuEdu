const express = require("express")
const app = express();
const port = 3000;
// 权限 全局接口 api/system/user/login
// 权限接口 api/***/user/login api/user/login
const systemuserpost = require("./api/SystemUserPost.js")
const stu = require("./api/Stu.js")


//对post请求的表单数据进行接受处理
app.use(express.urlencoded({extended: false}))

//对post请求的JSON数据进行接受处理
app.use(express.json());

app.use("/system/user",systemuserpost)
app.use("/stu",stu)

// app.get("/aaa",(req,res) =>{
//     res.send({
//         state:1,
//         message: "登录成功"
//     })
// })

app.listen(port,() =>{
    console.log(`服务器启动成功，端口号为${port}`);
})

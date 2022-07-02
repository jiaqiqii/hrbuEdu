const express = require("express")
const app = express();
const port = 3000;
// 权限 全局接口 api/system/user/login
// 权限接口 api/***/user/login api/user/login
const systemuserpost = require("./api/SystemUserPost.js")
const stu = require("./api/Stu.js")
const user = require("./api/User.js")
const classes = require("./api/Classes.js")
const teacher = require("./api/Teacher.js")
<<<<<<< HEAD
// 版本改变
const {expressjwt} = require("express-jwt");
const secretKey = 'jiaqq :-)'

=======
const shijuan = require("./api/shijuan.js")
const ceping = require("./api/ceping.js")

const role = require("./api/Role.js")
const school = require("./api/School.js")
const major = require("./api/Major.js")
const knowledge = require("./api/Knowledge.js")
>>>>>>> 159a1f9c83ff5c8930419a994aa373d62a9256c4

const uuid = require("uuid")
//对post请求的表单数据进行接受处理
app.use(express.urlencoded({extended: false}))

//对post请求的JSON数据进行接受处理
app.use(express.json());

app.use(expressjwt({
    secret:secretKey, //设置jwt算法
    algorithms:["HS256"]
}).unless({
    // 不需要验证的接口可以写多个
    path:[
        /^\/system\//
    ]
}))

// 解析JWT失败后
app.use((err,req,res,next) => {
    // token 解析失败导致的错误
    if(err.name === "UnauthorizedError"){
        return res.send({
            status:1,
            message:"无效的token"
        })
    }
    // 其他原因导致的错误
    res.send({
        status:2,
        message:"未知错误"

    })
})

app.use("/system/user",systemuserpost)
app.use("/stu",stu)
app.use("/user", user)
app.use("/class", classes)
app.use("/teacher", teacher)
app.use("/shijuan", shijuan)
app.use("/ceping", ceping)

app.use("/role", role)
app.use("/school", school)
app.use("/major", major)
app.use("/knowledge", knowledge)
 


app.get("/aaa",(req,res) =>{
    console.log(uuid.v4().replaceAll("-",""));
    console.log(uuid.v4().replaceAll("-",""));
    console.log(uuid.v4().replaceAll("-",""));
    console.log(uuid.v4().replaceAll("-",""));
    console.log(uuid.v4().replaceAll("-",""));
    console.log(uuid.v4().replaceAll("-",""));
    // console.log(uuid.parse("str"));
    // Parse a UUID
// const bytes = uuidParse('6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b');

// // Convert to hex strings to show byte order (for documentation purposes)
// [...bytes].map((v) => v.toString(16).padStart(2, '0'));
// // console.log(uuid.parse("asd").replaceAll("-",""));

    res.send({
        state:1,
        message: "登录成功"
    })
})

app.listen(port,() =>{
    console.log(`服务器启动成功，端口号为${port}`);
})

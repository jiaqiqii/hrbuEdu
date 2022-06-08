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

const uuid = require("uuid")
//对post请求的表单数据进行接受处理
app.use(express.urlencoded({extended: false}))

//对post请求的JSON数据进行接受处理
app.use(express.json());

app.use("/system/user",systemuserpost)
app.use("/stu",stu)
app.use("/user", user)
app.use("/class", classes)
app.use("/teacher", teacher)
 


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

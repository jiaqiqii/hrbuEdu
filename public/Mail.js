// 邮箱验证
const nodemailer = require('nodemailer'); //发送邮件的node插件

function sendEmail (email){   
    let content=`
    <head>
    <base target="_blank" />
    <style type="text/css">::-webkit-scrollbar{ display: none; }</style>
    <style id="cloudAttachStyle" type="text/css">#divNeteaseBigAttach, #divNeteaseBigAttach_bak{display:none;}</style>
    <style id="blockquoteStyle" type="text/css">blockquote{display:none;}</style>
    <style type="text/css">
        body{font-size:14px;font-family:arial,verdana,sans-serif;line-height:1.666;padding:0;margin:0;overflow:auto;white-space:normal;word-wrap:break-word;min-height:100px}
        td, input, button, select, body{font-family:Helvetica, 'Microsoft Yahei', verdana}
        pre {white-space:pre-wrap;white-space:-moz-pre-wrap;white-space:-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word;width:95%}
        th,td{font-family:arial,verdana,sans-serif;line-height:1.666}
        img{ border:0}
        header,footer,section,aside,article,nav,hgroup,figure,figcaption{display:block}
        blockquote{margin-right:0px}
        </style>
    </head>
    <body tabindex="0" role="listitem">
    <table width="700" border="0" align="center" cellspacing="0" style="width:700px;">
        <tbody>
        <tr>
            <td>
                <div style="width:700px;margin:0 auto;border-bottom:1px solid #ccc;margin-bottom:30px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="700" height="39" style="font:12px Tahoma, Arial, 宋体;">
                        <tbody><tr><td width="210"></td></tr></tbody>
                    </table>
                </div>
                <div style="width:680px;padding:0 10px;margin:0 auto;">
                    <div style="line-height:1.5;font-size:14px;margin-bottom:25px;color:#4d4d4d;">
                        <strong style="display:block;margin-bottom:15px;">尊敬的用户：<span style="color:#f60;font-size: 16px;"></span>您好！</strong>
                        <strong style="display:block;margin-bottom:15px;">
                             您的密码重置为123
                        </strong>
                    </div>
                    <div style="margin-bottom:30px;">
                        <small style="display:block;margin-bottom:20px;font-size:12px;">
                            <p style="color:#747474;">
                                注意：此操作可能会修改您的密码、登录邮箱或绑定手机。如非本人操作，请及时登录并修改密码以保证帐户安全
                                <br>（工作人员不会向你索取此验证码，请勿泄漏！）
                            </p>
                        </small>
                    </div>
                </div>
                <div style="width:700px;margin:0 auto;">
                    <div style="padding:10px 10px 0;border-top:1px solid #ccc;color:#747474;margin-bottom:20px;line-height:1.3em;font-size:12px;">
                        <p>此为系统邮件，请勿回复<br>
                            请保管好您的邮箱，避免账号被他人盗用
                        </p>
                        <p>中科安高（北京）科技有限公司</p>
                    </div>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
    </body>
`
    let transporter = nodemailer.createTransport({
        host: 'smtp.163.com', 
        port: 465, // SMTP 端口
        auth: {   //发送者的账户和授权码
            user: 'liyqi06@163.com', //账户
            pass: 'ASFFINGYXZLERVCZ', //smtp授权码，到邮箱设置下获取
        }
    });
    let mailOptions = {
        from: '"大唐ICT云端实验室" <liyqi06@163.com>', // 发送者昵称和地址
        to: email, // 接收者的邮箱地址
        subject: '重置密码', // 邮件主题
        html: content
    };
    //发送邮件
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('邮件发送成功 ID：', info.messageId);
    }); 
}


module.exports = sendEmail;

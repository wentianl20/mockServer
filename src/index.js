
var WebSocketServer = require('ws').Server

// 保存用户id
var users = []
var talkMessage= {}
var wss = new WebSocketServer({ port: 8181 });
wss.on('connection', function (ws) {
    console.log('client connected');
    ws.on('message', function (message) {
        message = JSON.parse(message)
        console.log(message)
        // 判断状态
        if(message.state==1) {
            // 注册用户时间
            users.push({
                id:message.id,
                name:message.name
            })

        }else if(message.state==3) {
            talkMessage = {
                name:message.name,
                time:message.time,
                value: message.value
            }
        }

        // 将更新的信息发送给所有用户
        updateAllUsername(message.state)
    });
    ws.on('close',(state,msg)=>{
        // 通过id删除用户表
        let id = JSON.parse(msg).id
        users= users.filter((item)=>{
            return item.id!==id
        })
        updateAllUsername(4)

    })
});
function updateAllUsername (state) {
    let result = ''
    console.log(state)
    if(state== 1||state==4) {
        result=users
    } else if (state == 3 ) {
        result = talkMessage
    }
    for(let item of wss.clients){
        item.send(`${state}`+JSON.stringify(result))
    }
}

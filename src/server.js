const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server

// 保存用户id
let users = []
let webSockets= {}
const wss = new WebSocketServer({ port: 8181 });
wss.on('connection', function (ws) {
    console.log(`client connected`);

    ws.on('message', function (message) {

        message = JSON.parse(message)
        if(!isJson(message)) {
            // console.log('not a JSON object ', message)
            return
        }
        console.log(message)
        // 判断状态
        if(message.state === 1) {
            if(users.find(u=> u.id === message.id)) {
                throw new Error('userId alrady in use !!!')
            }
            // 注册用户时间
            users.push({
                id:message.id, // sessionId
                connectionId: message.connectionId, // roomId
                data:message.data
            })
            webSockets[message.id] = ws

            console.log('register', users)
        }else if(message.state === 3) {
            let talkMessage = {
                name:message.name,
                time:message.time,
                value: message.value
            }
        } else if(message.state === 2) {
            //ping package
            return
        }

        // 将更新的信息发送给相关用户
        sendToUser(message)

        // setTimeout(() => {
        //     ws.send('lalalala')
        // },3000)
    });
    ws.on('close',(state,msg)=>{
        console.log('xxxxxxxxxxxxxxxxxx', state, msg)

        if(state === 1001) {
            return
        }
        // 通过id删除用户表
        const message = JSON.parse(msg)
        if(!isJson(message)) {
            console.log('not a json obj', message)
            return
        }
        const id = message.id
        users= users.filter((item)=>{
            return item.id!==id
        })
        delete webSockets[message.id]

        sendToUser(message)
    })

});

function sendToUser(message) {

    const targetUsers = users.filter(u=> u.connectionId === message.connectionId && u.id !== message.id)
    console.log('filter users: ', targetUsers)
    if(targetUsers.length > 0) {
        targetUsers.forEach(user => {
            const client = webSockets[user.id]
            // test here, auto disconnect if partner left
            // if(message.state === 4) {
            //     const mess = {
            //         id:user.id,
            //         connectionId: user.connectionId,
            //         state:4
            //     }
            //     client.close(3000, JSON.stringify(mess))
            //     return
            // }
            client.send(JSON.stringify(message))
        })
    } else {
        console.log('No more client now', users)
    }
}

function isJson(obj){
    const isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
    return isjson;
}
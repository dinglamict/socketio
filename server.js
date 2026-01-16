// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// 1. 创建 Express 应用和 HTTP 服务器
const app = express();
const server = http.createServer(app);

// 2. 配置 Socket.IO 并解决跨域问题（关键！否则客户端无法连接）
const io = new Server(server, {
    cors: {
        origin: "*", // 开发环境允许所有域名访问；生产环境替换为你的前端域名（如 http://localhost:8080）
        methods: ["GET", "POST"], // 允许的请求方法
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

// 存储需要共享的 value（全局变量，所有客户端共享）
let sharedValue = {
    data: null,
    updateTime: null
};

// 3. 监听客户端连接事件
io.on('connection', (socket) => {
    console.log(`✅ 客户端已连接：${socket.id}`);

    // ========== 自定义事件：更新 value ==========
    socket.on('update-shared-value', (newValue) => {
        sharedValue = {
            data: newValue,
            updateTime: new Date().toLocaleString()
        };
        // 广播给**所有连接的客户端**（你和同事都能实时收到更新）
        io.emit('value-updated', sharedValue);
        console.log(`🔄 全局 value 更新：`, sharedValue);
    });

    // ========== 自定义事件：获取当前 value ==========
    socket.on('get-shared-value', () => {
        // 只发送给当前请求的客户端
        socket.emit('current-value', sharedValue);
    });

    // ========== 监听客户端断开连接 ==========
    socket.on('disconnect', () => {
        console.log(`❌ 客户端已断开：${socket.id}`);
    });
});

// 4. 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Socket.IO 服务端运行在：http://localhost:${PORT}`);
});
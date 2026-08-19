const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let users = [
    { id: 1, name: "Amit", email: "amit@gmail.com", password: "amit@1123" },
    { id: 2, name: "Sunil", email: "sunil@gmail.com", password: "sunil@1123" }
];

io.on('connection', (socket) => {
    console.log("User with ID: " + socket.id + " is connected");

    // Send users list on connection
    socket.emit('users', users);

    socket.on('add-user', (data) => {
        const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const newUser = {
            id: nextId,
            name: data.name,
            email: data.email,
            password: data.password
        };
        users.push(newUser);
        io.emit('users', users);
    });

    socket.on('update-user', (data) => {
        const index = users.findIndex(u => u.id === Number(data.id));
        if (index !== -1) {
            users[index] = {
                id: Number(data.id),
                name: data.name,
                email: data.email,
                password: data.password
            };
            io.emit('users', users);
        }
    });

    socket.on('delete-user', (id) => {
        users = users.filter(u => u.id !== Number(id));
        io.emit('users', users);
    });

    socket.on('disconnect', () => {
        console.log("User with ID: " + socket.id + " is disconnected");
    });
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});


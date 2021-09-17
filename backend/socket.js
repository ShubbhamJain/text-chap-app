const io = require('socket.io')();

const Room = require('./models/rooms');
const User = require('./models/users');

let loggedInUsers = [];
let roomData = {};

io.on('connection', (socket) => {
    socket.on('user-logged-in', async loggedInUserId => {
        let found = false;
        const user = await User.findOne({ _id: loggedInUserId });

        if (user.active === false) {
            loggedInUsers.forEach(usr => {
                if (usr.id == loggedInUserId) {
                    usr.active = true;
                    return usr.socketId = socket.id;
                }
            });
            await User.updateOne({ _id: loggedInUserId }, { $set: { active: true } });
            socket.emit('logged-in-users', loggedInUsers);
            // send messages that they have to them, when they reload page
        }

        obj = {
            id: user.id,
            profilePic: user.profilePic,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            loggedIn: user.loggedIn,
            socketId: socket.id,
            active: true
        }

        if (loggedInUsers.length === 0) {
            loggedInUsers.push(obj);
            socket.emit('logged-in-users', loggedInUsers);
        } else {
            loggedInUsers.forEach(usr => {
                if (usr.id == loggedInUserId) {
                    return found = true;
                }
            });

            if (found === false) {
                console.log(35);
                loggedInUsers.push(obj);
                socket.emit('logged-in-users', loggedInUsers);
                socket.broadcast.emit('new-logged-in-user', obj);
            }
        }
    });

    socket.on('join room', async (message, userId, chatUserId) => {
        if (message && userId && chatUserId) {
            let roomDoc = await Room.find({ $or: [{ userOne: userId, userTwo: chatUserId }, { userOne: chatUserId, userTwo: userId }] });
            let room = roomDoc[0];

            if (room && Object.keys(obj).length !== 0 && obj.constructor === Object) {
                console.log(62);

                // await room.save();
                await Room.updateOne({ _id: room.id }, { $push: { 'messages': { [userId]: message } } });

                roomData[room.id].messages.push({ [userId]: message });
                console.log(roomData);

                let socketId;
                loggedInUsers.forEach(usr => {
                    if (usr.id === chatUserId) {
                        socketId = usr.socketId;
                    }
                });

                socket.emit('message-sent', room.id);
                socket.to(socketId).emit('message-received', room.id, userId, chatUserId, message);
            } else {
                try {
                    console.log(68);
                    let newRoom = new Room({
                        userOne: userId,
                        userTwo: chatUserId,
                        messages: [{
                            [userId]: message
                        }]
                    });

                    await newRoom.save();

                    roomData[newRoom.id] = {
                        userOne: newRoom.userOne,
                        userTwo: newRoom.userTwo,
                        messages: [{
                            [userId]: message
                        }]
                    }

                    console.log(roomData);

                    let socketId;
                    loggedInUsers.forEach(usr => {
                        if (usr.id === chatUserId) {
                            socketId = usr.socketId;
                        }
                    });

                    socket.emit('message-sent', room.id);
                    socket.to(socketId).emit('message-received', newRoom.id, userId, chatUserId, message);
                } catch (error) {
                    socket.emit('error in room creation', 'Error in room creation. Please reload the page and try again');
                }
            }
        } else {
            socket.emit('error in chating', 'Error in chating. Please reload the page and try again');
        }
    });

    socket.on('user-logged-out', async loggedOutUser => {
        let userLoggedOut;
        await User.updateOne({ _id: loggedOutUser.id }, { $set: { loggedIn: false, active: false } });
        loggedInUsers.forEach((usr, index) => {
            if (usr.id == loggedOutUser.id) {
                userLoggedOut = usr;
                loggedInUsers.splice(index, 1);
            }
        });

        socket.broadcast.emit('logout', userLoggedOut);
        socket.disconnect(true);
    });

    socket.on('disconnect', () => {
        loggedInUsers.forEach(async (usr, index) => {
            if (usr.socketId == socket.id) {
                await User.updateOne({ _id: usr.id }, { $set: { active: false } });
                usr.active = false;
            }
        });

        setTimeout(async () => {
            let disconnectedUser;
            let disconnectedUserIndex;
            loggedInUsers.forEach((usr, index) => {
                if (usr.socketId == socket.id && usr.active === false) {
                    disconnectedUser = usr;
                    disconnectedUserIndex = index;
                }
            });

            if (disconnectedUser) {
                const user = await User.findOne({ _id: disconnectedUser.id });
                if (user.active === false) {
                    loggedInUsers.splice(disconnectedUserIndex, 1);
                    io.emit('user-disconnected', loggedInUsers);
                }
            }
        }, 3000);
    });
});

module.exports = io;
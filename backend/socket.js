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
                if (usr.id === loggedInUserId) {
                    usr.active = true;
                    return usr.socketId = socket.id;
                }
            });
            await User.updateOne({ _id: loggedInUserId }, { $set: { active: true } });
            socket.emit('logged-in-users', loggedInUsers);
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
                if (usr.id === loggedInUserId) {
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

    socket.on('join room', async (userId, chatUserId) => {
        if (userId && chatUserId) {
            let socketId;

            loggedInUsers.forEach(usr => {
                if (usr.id === chatUserId) {
                    socketId = usr.socketId;
                }
            });

            const receiverData = await User.findById(chatUserId);
            const receiverInChat = receiverData.inRoom ? receiverData.inRoom : '';

            let roomDoc = await Room.find({ $or: [{ userOne: userId, userTwo: chatUserId }, { userOne: chatUserId, userTwo: userId }] });
            let room = roomDoc[0];

            if (room && Object.keys(room).length !== 0) {
                roomData[room.id] = {
                    userOne: room.userOne,
                    userTwo: room.userTwo,
                    messages: room.messages
                };

                await User.findByIdAndUpdate(userId, { $set: { inRoom: room.id, inChatWith: chatUserId } });

                socket.emit('room created for sender', room.id, roomData[room.id]);

                socket.to(socketId).emit('room created for receiver', receiverInChat, room.id, roomData[room.id]);
            } else {
                let newRoom = new Room({
                    userOne: userId,
                    userTwo: chatUserId
                });

                await newRoom.save();

                roomData[newRoom.id] = {
                    userOne: newRoom.userOne,
                    userTwo: newRoom.userTwo,
                    messages: newRoom.messages
                };

                await User.findByIdAndUpdate(userId, { $set: { inRoom: newRoom.id, inChatWith: chatUserId } });

                socket.emit('room created for sender', newRoom.id, roomData[newRoom.id]);

                socket.to(socketId).emit('room created for receiver', receiverInChat, newRoom.id, roomData[newRoom.id]);
            }
        } else {
            socket.emit('error in chating', 'Error in chating. Please reload the page and try again');
        }
    });

    socket.on('message sent', async (message, roomID, usrId, chatUsrId) => {
        if (message && roomID && usrId && chatUsrId) {
            let socketId;
            loggedInUsers.forEach(usr => {
                if (usr.id === chatUsrId) {
                    socketId = usr.socketId;
                }
            });

            let msgObj = { userId: usrId, message };

            await Room.updateOne({ _id: roomID }, { $push: { 'messages': msgObj } });

            roomData[roomID].messages.push(msgObj);

            const senderData = await User.findById(usrId);
            const receiverData = await User.findById(chatUsrId);

            const receiverInChat = receiverData.inRoom ? receiverData.inRoom : '';

            socket.emit('message received by sender', senderData.inRoom, msgObj);
            socket.to(socketId).emit('message received by receiver', receiverInChat, senderData.inRoom, msgObj);
        } else {
            socket.emit('error in chating', 'Error in chating. Please reload the page and try again');
        }
    });

    socket.on('user-logged-out', async loggedOutUser => {
        let userLoggedOut;
        await User.updateOne({ _id: loggedOutUser.id }, { $set: { loggedIn: false, active: false } });
        loggedInUsers.forEach((usr, index) => {
            if (usr.id === loggedOutUser.id) {
                userLoggedOut = usr;
                loggedInUsers.splice(index, 1);
            }
        });

        socket.broadcast.emit('logout', userLoggedOut);
        socket.disconnect(true);
    });

    socket.on('disconnect', () => {
        loggedInUsers.forEach(async (usr, index) => {
            if (usr.socketId === socket.id) {
                await User.updateOne({ _id: usr.id }, { $set: { active: false } });
                usr.active = false;
            }
        });

        setTimeout(async () => {
            let disconnectedUser;
            let disconnectedUserIndex;
            loggedInUsers.forEach((usr, index) => {
                if (usr.socketId === socket.id && usr.active === false) {
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
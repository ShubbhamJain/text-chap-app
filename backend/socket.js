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

    // we check wether roomData has the data or not. 
    // If data is present, we check in roomData whether the room is created in it or not for the two users
    // If room is created we use the room in roomData
    //  If not we create a new room in db and store data in roomData as well
    // If data is not present, we query the db
    // If db has no data of the room for the two users, we create room and store data in roomData as well
    // If data of room is their, we use that and populate roomData as well

    // we check db
    // if room is present in db, we check roomData for room data
    // if it has 
    socket.on('join room', async (userId, chatUserId) => {
        if (userId && chatUserId) {
            let socketId;

            loggedInUsers.forEach(usr => {
                if (usr.id === chatUserId) {
                    socketId = usr.socketId;
                }
            });

            let roomDoc = await Room.find({ $or: [{ userOne: userId, userTwo: chatUserId }, { userOne: chatUserId, userTwo: userId }] });
            let room = roomDoc[0];

            if (room && Object.keys(room).length !== 0) {
                console.log(81);
                roomData[room.id] = {
                    userOne: room.userOne,
                    userTwo: room.userTwo,
                    messages: room.messages
                };

                await User.findByIdAndUpdate(userId, { $set: { inRoom: room.id, inChatWith: chatUserId } });

                const receiverData = await User.findById(chatUserId);

                const receiverInChat = receiverData.inRoom ? receiverData.inRoom : '';

                socket.emit('room created for sender', room.id, roomData[room.id]);
                socket.to(socketId).emit('room created for receiver', receiverInChat, room.id, roomData[room.id]);
            } else {
                console.log(91);
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

                const receiverData = await User.findById(chatUserId);

                const receiverInChat = receiverData.inRoom ? receiverData.inRoom : '';

                socket.emit('room created for sender', newRoom.id, roomData[newRoom.id]);
                socket.to(socketId).emit('room created for receiver', newRoom.id, roomData[newRoom.id]);
            }

            // const checkRoomData = roomData && Object.keys(roomData).length !== 0 && roomData.constructor === Object;
            // let savedRoom = {};

            // if (checkRoomData) {
            //     console.log(75);
            //     for (const property in roomData) {
            //         const check1 = (roomData[property].userOne == userId && roomData[property].userTwo == chatUserId);
            //         const check2 = (roomData[property].userOne == chatUserId && roomData[property].userTwo == userId);
            //         if (check1 || check2) {
            //             savedRoom['roomid'] = property;
            //             savedRoom['roomdata'] = roomData[property];
            //         }
            //     }

            //     const checkRoom = savedRoom && Object.keys(savedRoom).length !== 0 && savedRoom.constructor === Object;

            //     console.log(checkRoom);

            //     if (checkRoom) {
            //         console.log(84, savedRoom);
            //         socket.emit('room created', savedRoom['roomid'], savedRoom['roomdata']);
            //         socket.to(socketId).emit('room created', savedRoom['roomid'], savedRoom['roomdata']);
            //     } else {
            //         console.log(93);
            //         let newRoom = new Room({
            //             userOne: userId,
            //             userTwo: chatUserId
            //         });

            //         await newRoom.save();

            //         roomData[newRoom.id] = {
            //             userOne: newRoom.userOne,
            //             userTwo: newRoom.userTwo,
            //             messages: newRoom.messages
            //         };

            //         socket.emit('room created', newRoom.id, roomData[newRoom.id]);
            //         socket.to(socketId).emit('room created', newRoom.id, roomData[newRoom.id]);
            //     }
            // } else {
            //     console.log(111);
            //     let roomDoc = await Room.find({ $or: [{ userOne: userId, userTwo: chatUserId }, { userOne: chatUserId, userTwo: userId }] });
            //     let room = roomDoc[0];

            //     if (room && Object.keys(room).length !== 0) {
            //         console.log(94);
            //         roomData[room.id] = {
            //             userOne: room.userOne,
            //             userTwo: room.userTwo,
            //             messages: room.messages
            //         };

            //         socket.emit('room created', room.id, roomData[room.id]);
            //         socket.to(socketId).emit('room created', room.id, roomData[room.id]);
            //     } else {
            //         console.log(126);
            //         let newRoom = new Room({
            //             userOne: userId,
            //             userTwo: chatUserId
            //         });

            //         await newRoom.save();

            //         roomData[newRoom.id] = {
            //             userOne: newRoom.userOne,
            //             userTwo: newRoom.userTwo,
            //             messages: newRoom.messages
            //         };

            //         socket.emit('room created', newRoom.id, roomData[newRoom.id]);
            //         socket.to(socketId).emit('room created', newRoom.id, roomData[newRoom.id]);
            //     }
            // }
            // console.log(savedRoom);

            // let roomDoc = await Room.find({ $or: [{ userOne: userId, userTwo: chatUserId }, { userOne: chatUserId, userTwo: userId }] });
            // let room = roomDoc[0];

            // let userRoomsData = {};

            // let socketId;
            // loggedInUsers.forEach(usr => {
            //     if (usr.id === chatUserId) {
            //         socketId = usr.socketId;
            //     }
            // });

            // if (room && Object.keys(room).length !== 0 && room.constructor === Object) {
            //     await Room.updateOne({ _id: room.id }, { $push: { 'messages': { userId, message } } });

            //     roomData[room.id].messages.push({ userId, message });

            //     Object.keys(roomData).forEach(roomId => {
            //         if ((roomData[roomId].userOne == userId) || (roomData[roomId].userTwo == userId)) {
            //             userRoomsData[roomId] = roomData[roomId];
            //         }
            //     })
            //     console.log(79, userRoomsData);

            //     socket.emit('message-received', room.id, userRoomsData);
            //     socket.to(socketId).emit('message-received', room.id, userRoomsData);
            // } else {
            //     try {
            //         let newRoom = new Room({
            //             userOne: userId,
            //             userTwo: chatUserId,
            //             messages: [{ userId, message }]
            //         });

            //         await newRoom.save();

            //         roomData[newRoom.id] = {
            //             userOne: newRoom.userOne,
            //             userTwo: newRoom.userTwo,
            //             messages: [{ userId, message }]
            //         }

            //         Object.keys(roomData).forEach(rId => {
            //             if ((roomData[rId].userOne == userId) || (roomData[rId].userTwo == userId)) {
            //                 userRoomsData[rId] = roomData[rId];
            //             }
            //         })
            //         console.log(105, userRoomsData);

            //         socket.emit('message-received', newRoom.id, userRoomsData);
            //         socket.to(socketId).emit('message-received', newRoom.id, userRoomsData);
            //     } catch (error) {
            //         socket.emit('error in room creation', 'Error in room creation. Please reload the page and try again');
            //     }
            // }
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
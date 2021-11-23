const io = require('socket.io')();

const Room = require('./models/rooms');
const User = require('./models/users');
const Group = require('./models/groups');

let loggedInUsers = [];
let roomData = {};

io.on('connection', (socket) => {
    socket.on('user-logged-in', async loggedInUserId => {
        try {
            let found = false;
            const user = await User.findOne({ _id: loggedInUserId });
            const groups = await Group.find({ users: { $elemMatch: { id: loggedInUserId } } });

            if (user && user?.active === false) {
                loggedInUsers.forEach(usr => {
                    if (usr.id === loggedInUserId) {
                        usr.active = true;
                        return usr.socketId = socket.id;
                    }
                });
                await User.updateOne({ _id: loggedInUserId }, { $set: { active: true } });
                socket.emit('logged-in-users', loggedInUsers, groups);
            }

            obj = {
                id: user.id,
                profilePic: user.profilePic,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                loggedIn: user.loggedIn,
                socketId: socket.id,
                active: true,
                inRoom: '',
                inChatWith: '',
                notifications: user.notifications,
                groupNotifications: user.groupNotifications
            }

            if (loggedInUsers.length === 0) {
                loggedInUsers.push(obj);
                socket.emit('logged-in-users', loggedInUsers, groups);
            } else {
                loggedInUsers.forEach(usr => {
                    if (usr.id === loggedInUserId) {
                        return found = true;
                    }
                });

                if (found === false) {
                    loggedInUsers.push(obj);
                    socket.emit('logged-in-users', loggedInUsers, groups);
                    socket.broadcast.emit('new-logged-in-user', obj);
                }
            }
        } catch (error) {
            socket.emit('error in chating', 'Error in chating. Please reload the page and try again');
        }
    });

    socket.on('join room', async (userId, chatUserId) => {
        try {
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

                    const usr = await User.findById(userId);

                    // already created room, checking if user has any notification from the other user,
                    // if yes, we remove the other user's id from user's notifications array
                    if (usr.notifications.indexOf(chatUserId) >= 0) {
                        await User.findByIdAndUpdate(userId, { $set: { inRoom: room.id, inChatWith: chatUserId }, $pull: { notifications: chatUserId } });

                        loggedInUsers.forEach(usr => {
                            if (usr.id === userId) {
                                usr.inRoom = room.id;
                                usr.inChatWith = chatUserId;
                                usr.notifications.splice(chatUserId, 1);
                            }
                        });

                    } else {
                        await User.findByIdAndUpdate(userId, { $set: { inRoom: room.id, inChatWith: chatUserId } });

                        loggedInUsers.forEach(usr => {
                            if (usr.id === userId) {
                                usr.inRoom = room.id;
                                usr.inChatWith = chatUserId;
                            }
                        });
                    }

                    socket.emit('room created for sender', room.id, roomData[room.id], loggedInUsers);

                    socket.to(socketId).emit('room created for receiver', receiverInChat, room.id, roomData[room.id], loggedInUsers);
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

                    loggedInUsers.forEach(usr => {
                        if (usr.id === userId) {
                            usr.inRoom = newRoom.id;
                            usr.inChatWith = chatUserId;
                        }
                    });

                    socket.emit('room created for sender', newRoom.id, roomData[newRoom.id], loggedInUsers);

                    socket.to(socketId).emit('room created for receiver', receiverInChat, newRoom.id, roomData[newRoom.id], loggedInUsers);
                }
            } else {
                socket.emit('error in chating', 'Error in chating. Please reload the page and try again');
            }
        } catch (error) {
            console.log(error);
            socket.emit('error in chating', 'Error in chating. Please reload the page and try again');
        }
    });

    socket.on('message sent', async (message, roomID, usrId, chatUsrId) => {
        try {
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

                const receiverInChat = receiverData.inRoom ? receiverData.inRoom.toString() : '';

                //pushing sender's id into receivers data for notification if user is not already in the chat room
                if (receiverInChat !== roomID) {
                    if (!receiverData.notifications.includes(usrId)) {
                        await User.findByIdAndUpdate(chatUsrId, { $push: { notifications: usrId } });

                        loggedInUsers.forEach(usr => {
                            if (usr.id === chatUsrId) {
                                usr.notifications.push(usrId);
                            }
                        });
                    }
                }

                socket.emit('message received by sender', senderData.inRoom, msgObj);
                socket.to(socketId).emit('message received by receiver', receiverInChat, senderData.inRoom, msgObj, loggedInUsers);
            } else {
                socket.emit('error in chating', 'Error in chating. Please reload the page and try again');
            }
        } catch (error) {
            console.log(error);
            socket.emit('error in chating', 'Error in chating. Please reload the page and try again');
        }
    });

    socket.on('create-group', async (groupInfo) => {
        try {
            let groupUsrs = groupInfo.users;

            loggedInUsers.forEach(usr => {
                for (let i = 0; i < groupUsrs.length; i++) {
                    if (usr.id === groupUsrs[i].id) {
                        if (i === 0) {
                            socket.to(usr.socketId).emit('group-created', groupInfo);
                        } else {
                            socket.to(usr.socketId).emit('added-to-created-group', groupInfo);
                        }
                    }
                }
            });
        } catch (error) {
            console.log(error);
            socket.emit('error in group creation', 'Error in group creation. Please reload the page and try again');
        }
    });

    socket.on('set-groupchat-for-user', async (userId, groupId) => {
        try {
            await User.updateOne({ _id: userId }, { $set: { inRoom: groupId, inChatWith: groupId } });
            await User.updateOne({ _id: userId }, { $pull: { groupNotifications: { groupId: groupId } } }, { multi: true });

            loggedInUsers.forEach(async (usr) => {
                if (usr.id === userId) {
                    usr.inRoom = groupId;
                    usr.inChatWith = groupId;
                    if (usr.groupNotifications.length > 0) {
                        usr.groupNotifications.map(async (notif, index) => {
                            if (notif.groupId === groupId) {
                                usr.groupNotifications.splice(index, 1);
                            }
                        });
                    }
                }
            });
        } catch (error) {
            console.log(error);
            socket.emit('error in chatting', 'Error in group chatting. Please reload the page and try again');
        }
    });

    socket.on('group message sent', async (message, userId, groupId) => {
        try {
            let sender = await User.findOne({ _id: userId });

            let msgObj = { userId: userId, userName: sender.firstName + ' ' + sender.lastName, message: message };

            await Group.updateOne({ _id: groupId }, { $push: { 'messages': msgObj } });

            let group = await Group.findOne({ _id: groupId });

            loggedInUsers.forEach(async (usr) => {
                if (usr.id === userId) {
                    socket.to(usr.socketId).emit('message-sent-to-sender', groupId, group);
                } else {
                    for (let i = 0; i < group.users.length; i++) {
                        if (usr.id === group.users[i].id && usr.id !== userId) {
                            if (usr.inRoom !== groupId) {
                                const notificationObj = {
                                    groupId: groupId,
                                    userId: userId
                                };

                                await User.updateOne({ _id: group.users[i].id }, { $push: { groupNotifications: notificationObj } });

                                usr.groupNotifications.push(notificationObj);
                            }

                            socket.to(usr.socketId).emit('message-sent-to-receivers', usr.inRoom, groupId, group, msgObj);
                        }
                    }
                }
            });
        } catch (error) {
            console.log(error);
            socket.emit('error in chatting', 'Error in group chatting. Please reload the page and try again');
        }
    });

    socket.on('user-logged-out', async loggedOutUser => {
        try {
            let userLoggedOut;
            await User.updateOne({ _id: loggedOutUser.id }, { $set: { loggedIn: false, active: false }, $unset: { inRoom: '', inChatWith: '' } });
            loggedInUsers.forEach((usr, index) => {
                if (usr.id === loggedOutUser.id) {
                    userLoggedOut = usr;
                    loggedInUsers.splice(index, 1);
                }
            });

            loggedInUsers.forEach(usr => {
                socket.to(usr.socketId).emit('logout', userLoggedOut);
            });
            socket.disconnect(true);
        } catch (error) {
            console.log(error);
            socket.emit('error in chatting', 'Error in group chatting. Please reload the page and try again');
        }
    });

    socket.on('disconnect', () => {
        try {
            loggedInUsers.forEach(async (usr, index) => {
                if (usr.socketId === socket.id) {
                    await User.updateOne({ _id: usr.id }, { $set: { active: false }, $unset: { inRoom: '', inChatWith: '' } });
                    usr.active = false;
                    usr.inChatWith = '';
                    usr.inRoom = '';
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
        } catch (error) {
            console.log(error);
            socket.emit('error in chatting', 'Error in group chatting. Please reload the page and try again');
        }
    });
});

module.exports = io;
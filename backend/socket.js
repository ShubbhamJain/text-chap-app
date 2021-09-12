const io = require('socket.io')();

const User = require('./models/users');

let loggedInUsers = [];

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
            console.log(13);
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
            console.log(24);
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

    socket.on('join room', (message, user) => {
        io.emit('receive-message', message, user);
    });

    socket.on('user-logged-out', async loggedOutUser => {
        loggedInUsers.forEach((usr, index) => {
            if (usr.id == loggedOutUser.id) {
                loggedInUsers.splice(index, 1);
            }
        });

        io.emit('logout', loggedInUsers);
    });

    socket.on('disconnect', () => {
        console.log(64);
        loggedInUsers.forEach(async (usr, index) => {
            if (usr.socketId == socket.id) {
                console.log(73);
                await User.updateOne({ _id: usr.id }, { $set: { active: false } });
                usr.active = false;
            }
        });

        // setTimeout(() => {
        //     loggedInUsers.forEach((usr, index) => {
        //         if (usr.socketId == socket.id && usr.active === false) {
        //             loggedInUsers.splice(index, 1);
        //         }
        //     });
        //     io.emit('user-disconnected', loggedInUsers);
        // }, 3000);
    });
});

module.exports = io;
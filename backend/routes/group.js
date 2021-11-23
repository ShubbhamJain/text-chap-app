const express = require('express');
const User = require('../models/users');
const Group = require('../models/groups')
const auth = require('../middleware/auth');
const { upload } = require('../utils');
const { getBucket } = require('../config/db');

const router = express.Router();

router.post('/', auth, upload.single('groupPic'), async (req, res) => {
    try {
        const { userId, groupName, groupUsers } = req.body;
        const { filename } = req.file;

        const groupUsrs = JSON.parse(groupUsers);

        const user = await User.findOne({ _id: userId });

        let group = [];

        group.push({
            id: user.id,
            profilePic: user.profilePic,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        });

        for (let i = 0; i < groupUsrs.length; i++) {
            group.push({
                id: groupUsrs[i].id,
                profilePic: groupUsrs[i].profilePic,
                firstName: groupUsrs[i].firstName,
                lastName: groupUsrs[i].lastName,
                email: groupUsrs[i].email
            });
        }

        let newGroup = new Group({
            groupImg: filename,
            name: groupName,
            users: group
        });

        newGroup.save();

        res.json({
            error: false,
            groupInfo: {
                id: newGroup.id,
                type: newGroup.type,
                groupImg: newGroup.groupImg,
                name: newGroup.name,
                users: newGroup.users,
                messages: newGroup.messages,
                notifications: newGroup.notifications
            },
        });
    } catch (error) {
        console.error(error);
        res.send(error).status(500);
    }
});

router.get('/groupImg/:filename', async (req, res) => {
    try {
        const { filename } = req.params;

        if (filename == undefined || filename === null || !filename) {
            return res.json({ error: true, message: 'File not found' });
        }

        const bucket = getBucket();

        if (bucket) {
            await bucket
                .find({ filename: filename })
                .toArray((err, file) => {
                    if (!file || file.length === 0) {
                        console.error(err);
                        return res.json({ error: true, message: 'File not found' });
                    }

                    if (['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file[0].contentType)) {
                        bucket.openDownloadStreamByName(filename).pipe(res);
                    }
                });
        } else {
            return res.json({ error: true, message: 'File not found' });
        }
    } catch (error) {
        console.error(error);
        return res.send(error).status(500);
    }
});

module.exports = router;
import { React, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { io } from 'socket.io-client'
import { PATHS } from '../../../config';
import { chatUserDropDownMenu, clearAuth, errorToastStyles, getAuthInfo, infoToastIconTheme, infoToastStyles, successToastIconTheme, successToastStyles, userDropDownMenu } from '../../../utils';
import ChatScreenMessageInputComp from '../ChatScreenMessageInputComp/ChatScreenMessageInputComp';
import ChatUsersComp from '../ChatUsersComp/ChatUsersComp';
import UserInfoComp from '../UserInfoComp/UserInfoComp';
import Toast from '../Toast/Toast';
import toast, { Toaster } from 'react-hot-toast';
import { apiUrl } from '../../../utils';
import MyDetails from '../MyDetails/MyDetails';
import GroupButton from '../Group/GroupButton';
import { groupCall } from '../../../config/apiCalls';
import GroupInfoComp from '../GroupInfoComp/GroupInfoComp';
import GroupDetails from '../GroupDetails';

const ChatScreen = () => {
    const history = useHistory();

    const [loggedInUsers, setLoggedInUsers] = useState([]);
    const [roomId, setRoomId] = useState('');
    const [roomData, setRoomData] = useState({});
    const [userNotifications, setUserNotifications] = useState([]);
    const [groupNotifications, setGroupNotifications] = useState([]);
    const [showMyDetails, setShowMyDetails] = useState(false);
    const [showChatUserDetails, setShowChatUserDetails] = useState(false);
    const [showGroups, setShowGroups] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [checkGroupImg, setCheckGroupImg] = useState(false);
    const [groupUsers, setGroupUsers] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [userInChat, setUserInChat] = useState([]);
    const [groupInChat, setGroupInChat] = useState([]);

    const socketRef = useRef(null);
    const myLoggedInUsers = useRef(loggedInUsers);
    const myUserGroups = useRef(userGroups);
    const groupUserSelection = useRef([]);
    const groupImgRef = useRef();
    const textMessage = useRef();
    const messageContainer = useRef(null);

    const user = getAuthInfo().user;

    useEffect(() => {
        return () => {
            socketRef.current.disconnect();
            socketRef.current = null;
            setRoomData({});
            setLoggedInUsers([]);
            myLoggedInUsers.current = [];
            setUserInChat([]);
            setGroupInChat([]);
            setUserGroups([]);
            setGroupUsers([]);
            setUserNotifications([]);
            setGroupNotifications([]);
        }
    }, []);

    useEffect(() => {
        socketRef.current = io.connect(apiUrl, { transports: ['websocket'], upgrade: false });

        // When user logs in
        socketRef.current.emit('user-logged-in', user.id);

        // We show logged in users in the panel to the newly logged in user
        socketRef.current.on('logged-in-users', (loggedInUsrs, groupsOfUser) => {
            setLoggedInUsers(loggedInUsrs);
            myLoggedInUsers.current = loggedInUsrs;

            setUserGroups(groupsOfUser);
            myUserGroups.current = groupsOfUser;

            loggedInUsrs.forEach(usr => {
                if (usr.id === user.id) {
                    setUserNotifications(usr.notifications);
                    setGroupNotifications(usr.groupNotifications);
                }
            });
        });

        // When a new user logs in and joins the chat, we inform other users in chat about the new user
        socketRef.current.on('new-logged-in-user', newLoggedInUsr => {
            let found = false;

            loggedInUsers.forEach(usr => {
                if (newLoggedInUsr.id === usr.id) {
                    return found = true;
                }
            });

            if (found === false) {
                setLoggedInUsers([...loggedInUsers, newLoggedInUsr]);
                myLoggedInUsers.current = [...myLoggedInUsers.current, newLoggedInUsr];
            }
        });

        // User logs out
        socketRef.current.on('logout', userLoggedOut => {
            showToast('info', 'User Logout', `User ${userLoggedOut.firstName} ${userLoggedOut.lastName} logged out`);
            setLoggedInUsers(curr => curr.filter(usr => usr.id !== userLoggedOut.id));
        });

        // User disconnects
        socketRef.current.on('user-disconnected', loggedInUsrs => {
            setLoggedInUsers(loggedInUsrs);
        });

        socketRef.current.on('room created for sender', (rId, rData, loggedInUsrs) => {
            setLoggedInUsers(loggedInUsrs);
            loggedInUsrs.forEach(usr => {
                if (usr.id === user.id) {
                    setUserNotifications(usr.notifications);
                }
            });

            setRoomData({ ...roomData, [rId]: { ...rData } });
            setRoomId(rId);
        });

        socketRef.current.on('room created for receiver', (receiverInChatWithId, rId, rData, loggedInUsrs) => {
            if (receiverInChatWithId !== rId) {
                setLoggedInUsers(loggedInUsrs);
                loggedInUsrs.forEach(usr => {
                    if (usr.id === user.id) {
                        setUserNotifications(usr.notifications);
                    }
                });
            }

            if (receiverInChatWithId === rId) {
                setRoomData({ ...roomData, [rId]: { ...rData } });
                setRoomId(receiverInChatWithId);
            }
        });

        socketRef.current.on('message received by sender', (rId, msgObj) => {
            if (rId && msgObj && Object.keys(roomData).length) {
                setRoomData(curr => ({
                    ...curr,
                    [rId]: { ...curr[rId], messages: [...curr[rId].messages, msgObj] }
                }));
                setRoomId(rId);
            }
        });

        socketRef.current.on('message received by receiver', (receiverInChatWithId, rId, msgObj, loggedInUsrs) => {
            if (rId && msgObj) {
                let usrName = '';

                setLoggedInUsers(loggedInUsrs);
                loggedInUsrs.forEach(usr => {
                    if (usr.id === user.id && roomId !== rId) {
                        setUserNotifications(usr.notifications);
                    }
                });

                myLoggedInUsers.current.forEach(usr => {
                    if (msgObj.userId === usr.id) {
                        usrName = usr.firstName + ' ' + usr.lastName;
                    }
                });

                if (roomId !== rId) {
                    showToast('success', `New Message From ${usrName}`, msgObj.message);
                }
            } else {
                showToast('danger', 'Error', 'Error in receiving messages, please reload page.');
            }

            if (receiverInChatWithId === rId) {
                setRoomData(curr => ({
                    ...curr,
                    [rId]: { ...curr[rId], messages: [...curr[rId].messages, msgObj] }
                }));
                setRoomId(receiverInChatWithId);
            }
        });

        socketRef.current.on('group-created', groupInfo => {
            setUserInChat([]);
            setShowGroups(true);
            setRoomId(groupInfo.id);
            setGroupInChat([groupInfo]);
        });

        socketRef.current.on('added-to-created-group', groupInfo => {
            showToast('success', 'Added to Group', `Your are added to group ${groupInfo.name}`);
            setUserGroups(curr => [groupInfo, ...curr]);
        });

        socketRef.current.on('message-sent-to-sender', (groupId, groupData) => {
            let group = {};
            let groups = [];

            myUserGroups.current.forEach(grp => {
                if (grp._id === groupId) {
                    group = groupData;
                    groups.push(groupData);
                } else {
                    groups.push(grp);
                }
            });

            setUserGroups(groups);
            setGroupInChat([group]);
        });

        socketRef.current.on('message-sent-to-receivers', (usrRoomId, groupId, groupData, message) => {
            let groups = [];

            myUserGroups.current.forEach(grp => {
                if (grp._id === groupId) {
                    groups.push(groupData);
                } else {
                    groups.push(grp);
                }
            });

            setUserGroups(groups);

            if (usrRoomId === groupId) {
                setRoomId(groupId);
                setGroupInChat([groupData]);
            } else if (usrRoomId !== groupId) {
                showToast('success', `New Message In ${groupData.name}`, `${message.userName}: ${message.message}`);

                let loggedInUsrs = [];

                for (let i = 0; i < myLoggedInUsers.current.length; i++) {
                    let usr = myLoggedInUsers.current[i];
                    if (usr.id === user.id) {
                        usr.groupNotifications.push({ userId: message.userId, groupId: groupId });
                        setGroupNotifications(usr.groupNotifications);
                    }
                    loggedInUsrs.push(usr);
                }

                setLoggedInUsers(loggedInUsrs);
                myLoggedInUsers.current = loggedInUsrs;
            }
        });

        socketRef.current.on('error in chating', msg => {
            console.log(156, msg);
            showToast('danger', 'Error', 'Error in chatting, please reload page.');
        });

        socketRef.current.on('error', (error) => {
            console.log(161, error);
            showToast('danger', 'Error', 'Error in chatting, please reload page.');
        });

        scrollToBottom();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loggedInUsers, roomId, roomData, user, userGroups, groupNotifications]);

    const setChatUser = ({ id, profilePic, firstName, lastName, email, socketId }) => {
        setGroupInChat([]);
        setUserInChat([{ id, profilePic, firstName, lastName, email, socketId }]);

        let userInRoomAlready = false;
        let changedRoomId = '';

        for (const property in roomData) {
            if ((user.id === roomData[property].userOne && id === roomData[property].userTwo) ||
                (user.id === roomData[property].userTwo && id === roomData[property].userOne)) {
                if (roomId === property) {
                    userInRoomAlready = true;
                }
                changedRoomId = property;
            }
        }

        if (userInRoomAlready === false) {
            setRoomId(changedRoomId);
        }
        socketRef.current.emit('join room', user.id, id);
    }

    const setChatGroup = (grpInfo) => {
        if (grpInfo._id !== roomId) {
            setUserInChat([]);
            setRoomId(grpInfo._id);
            setGroupInChat([grpInfo]);

            let loggedInUsrs = [...loggedInUsers];

            for (let i = 0; i < loggedInUsrs.length; i++) {
                let usr = loggedInUsrs[i];
                if (usr.id === user.id) {
                    if (usr.groupNotifications.length > 0) {
                        usr.groupNotifications = usr.groupNotifications.filter((notif, index) => notif.groupId !== grpInfo._id);
                    }
                    setGroupNotifications(usr.groupNotifications);
                }
            }

            setLoggedInUsers(loggedInUsrs);
            myLoggedInUsers.current = loggedInUsrs;
            socketRef.current.emit('set-groupchat-for-user', user.id, grpInfo._id);
        }
    }

    const scrollToBottom = () => {
        messageContainer.current?.scrollIntoView({ behavior: "smooth" })
    }

    const sendMessage = (event) => {
        event.preventDefault();

        if (textMessage.current.value) {
            if (groupInChat.length > 0) {
                socketRef.current.emit('group message sent', textMessage.current.value, user.id, groupInChat[0]._id);
            } else {
                let roomID;

                for (const property in roomData) {
                    if ((user.id === roomData[property].userOne && userInChat[0].id === roomData[property].userTwo) ||
                        (user.id === roomData[property].userTwo && userInChat[0].id === roomData[property].userOne)) {
                        roomID = property;
                    }
                }

                socketRef.current.emit('message sent', textMessage.current.value, roomID, user.id, userInChat[0].id);
            }
            textMessage.current.value = '';
        }
    }

    const showToast = (type, title, description) => {
        switch (type) {
            case 'success':
                return toast.success((t) => (
                    <Toast title={title} description={description} />
                ), {
                    style: successToastStyles,
                    iconTheme: successToastIconTheme
                });
            case 'danger':
                return toast.error((t) => (
                    <Toast title={title} description={description} />
                ), {
                    style: errorToastStyles
                });
            case 'info':
                return toast.success((t) => (
                    <Toast title={title} description={description} />
                ), {
                    duration: 5000,
                    style: infoToastStyles,
                    iconTheme: infoToastIconTheme
                });
            default:
                break;
        }
    }

    const onClickHandler = (item) => {
        if (item === 'Logout') {
            socketRef.current.emit('user-logged-out', user);
            clearAuth();
            history.push(PATHS.HOME);
        }

        if (item === 'My Profile') {
            setShowMyDetails(true);
        }

        if (item === 'Details') {
            setShowChatUserDetails(true);
        }
    }

    const toggleDetails = (detailsSelection) => {
        if (detailsSelection === 'My profile') {
            setShowMyDetails(curr => !curr);
        } else if (detailsSelection === 'Details') {
            setShowChatUserDetails(curr => !curr);
        }
    }

    const updateGroup = (event, chatUser) => {
        if (event.target.checked) {
            setGroupUsers(curr => [...curr, chatUser]);
        } else {
            setGroupUsers(curr => curr.filter(usr => usr.id !== chatUser.id));
        }
    }

    const createGroup = async () => {
        if (groupUsers.length >= 2 || groupName.length <= 0 || groupImgRef.current.files[0]) {
            const groupFormData = new FormData();

            groupFormData.append('groupPic', groupImgRef.current.files[0]);
            groupFormData.append('userId', user.id);
            groupFormData.append('groupName', groupName);
            groupFormData.append('groupUsers', JSON.stringify(groupUsers));

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }

            const response = await groupCall(groupFormData, config);

            if (response.error) {
                showToast('dander', 'Login error', 'Please re-login to continue chatting');
            } else {
                setUserGroups(curr => [response.groupInfo, ...curr]);

                socketRef.current.emit('create-group', response.groupInfo);

                groupUserSelection.current.forEach(selection => {
                    if (selection) {
                        selection.checked = false;
                    }
                });
                setGroupUsers(curr => curr.splice(0, -1));
            }
        }
    }

    const handleShowGroup = () => {
        setShowGroups(curr => !curr);
    }

    const handleGroupImg = () => {
        if (groupImgRef.current.files[0]) {
            setCheckGroupImg(true);
        } else {
            setCheckGroupImg(false);
        }
    }

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />

            <div className='container-fluid px-5 h-100'>
                <div className='row justify-content-center py-md-5 h-100'>
                    <div className='col-10 col-md-4 order-2 order-md-1 p-0 fill overflow-auto mt-2 mt-md-0 border h-100'>
                        <div className='sticky-top'>
                            <UserInfoComp picClass='userInfoImage' profilePic={`${apiUrl}/user/profilePic/${user.profilePic}`}
                                onClickHandler={onClickHandler} email={user.email} dropDownMenu={userDropDownMenu}
                                toggleDetails={toggleDetails} showDetails={showMyDetails} detailsSelection='My profile'
                            >
                            </UserInfoComp>
                        </div>

                        {
                            !showMyDetails &&
                            <GroupButton loggedInUsers={loggedInUsers} user={user} groupImgRef={groupImgRef} groupName={groupName}
                                setGroupName={setGroupName} groupUsers={groupUsers} updateGroup={updateGroup} createGroup={createGroup}
                                groupUserSelectionRef={groupUserSelection} showGroups={showGroups} handleShowGroup={handleShowGroup}
                                handleGroupImg={handleGroupImg} checkGroupImg={checkGroupImg}
                            />
                        }

                        {
                            showMyDetails ?
                                <MyDetails profilePic={`${apiUrl}/user/profilePic/${user.profilePic}`}
                                    firstName={user.firstName} lastName={user.lastName} email={user.email}
                                />
                                :
                                showGroups ?
                                    <div>
                                        {
                                            userGroups && userGroups.length === 0 ?
                                                <p className='text-center fs-4' style={{ marginTop: '50%' }}>No Groups to chat</p>
                                                :
                                                userGroups && userGroups.map((grp, index) => {
                                                    return (
                                                        <div key={index} onClick={() => setChatGroup(grp)}>
                                                            <div className='d-flex flex-row align-items-center chatUser'>
                                                                <img className='chatUsersImg me-3' src={`${apiUrl}/group/groupImg/${grp.groupImg}`} alt='ProfilePic' style={{ objectFit: 'cover', width: '60px', height: '60px' }} />
                                                                <div className='d-flex flex-column flex-grow-1'>
                                                                    <h5 className='mb-1'>{grp.name}</h5>
                                                                </div>

                                                                {
                                                                    groupNotifications && groupNotifications.length && (groupNotifications.find(notif => notif.groupId === grp._id) ? true : false) ? (
                                                                        <div key={index}>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="green" className="bi bi-dot d-inline" viewBox="0 0 16 16">
                                                                                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                                                                            </svg>
                                                                        </div>
                                                                    ) : null
                                                                }
                                                            </div>
                                                            <hr className='m-0' />
                                                        </div>
                                                    )
                                                })
                                        }
                                    </div>
                                    :
                                    <div>
                                        {
                                            (loggedInUsers.length === 0 || (loggedInUsers.length === 1 && loggedInUsers[0].id === user.id)) ?
                                                <p className='text-center fs-4' style={{ marginTop: '50%' }}>No Users available to chat</p>
                                                :
                                                loggedInUsers.map((chatUser, index) => {
                                                    return chatUser.id === user.id ? null :
                                                        (
                                                            <ChatUsersComp key={index} id={chatUser.id} picClass='chatUsersImg' profilePic={`${apiUrl}/user/profilePic/${chatUser.profilePic}`}
                                                                firstName={chatUser.firstName} lastName={chatUser.lastName} email={chatUser.email} socketId={chatUser.socketId}
                                                                setChatUser={setChatUser} lastMessageFrom='You' lastMessage='Hello' notifications={userNotifications}
                                                            />
                                                        )
                                                })
                                        }
                                    </div>
                        }
                    </div>

                    <div className='col-10 col-md-7 order-1 order-md-2 p-0 fill bg-cyan position-relative h-100'>
                        {
                            groupInChat.length > 0 ?
                                <>
                                    <div className='sticky-top'>
                                        <GroupInfoComp picClass='chatUserInfoImage' groupImg={`${apiUrl}/group/groupImg/${groupInChat[0].groupImg}`}
                                            groupName={groupInChat[0].name} onClickHandler={onClickHandler} dropDownMenu={chatUserDropDownMenu}
                                            toggleDetails={toggleDetails} showDetails={showChatUserDetails} detailsSelection='Details'
                                        >
                                        </GroupInfoComp>
                                    </div>

                                    {
                                        showChatUserDetails ?
                                            <GroupDetails
                                                groupImg={`${apiUrl}/group/groupImg/${groupInChat[0].groupImg}`}
                                                groupName={groupInChat[0].name}
                                                groupUsers={groupInChat[0].users}
                                            />
                                            :
                                            <>
                                                <div className='h-75 overflow-scroll' id='messageContainer'>
                                                    {
                                                        groupInChat && groupInChat[0] ?
                                                            groupInChat[0].messages.map((message, index) => (
                                                                <div className={message.userId === user.id ? 'm-2 d-flex justify-content-end' : 'm-2'} key={index}>
                                                                    <div className='bg-white rounded w-con p-2 pe-4'>
                                                                        <p className='m-0 text-primary'>{message.userId === user.id ? 'Me' : message.userName}</p>
                                                                        <p className='m-0'>{message.message}</p>
                                                                    </div>
                                                                </div>
                                                            )) : null
                                                    }
                                                    <div ref={messageContainer}></div>
                                                </div>

                                                <div>
                                                    <ChatScreenMessageInputComp sendMessage={sendMessage} textMessage={textMessage} />
                                                </div>
                                            </>
                                    }
                                </>
                                :
                                userInChat.length === 0 ?
                                    <p className='text-center fs-4' style={{ marginTop: '50%' }}>Select User/Group To Chat</p>
                                    :
                                    <>
                                        <div className='sticky-top'>
                                            <UserInfoComp picClass='chatUserInfoImage' profilePic={userInChat[0].profilePic}
                                                firstName={userInChat[0].firstName} lastName={userInChat[0].lastName} email={userInChat[0].email}
                                                onClickHandler={onClickHandler} dropDownMenu={chatUserDropDownMenu} toggleDetails={toggleDetails}
                                                showDetails={showChatUserDetails} detailsSelection='Details'
                                            >
                                            </UserInfoComp>
                                        </div>

                                        {
                                            showChatUserDetails ?
                                                <MyDetails profilePic={userInChat[0].profilePic} firstName={userInChat[0].firstName}
                                                    lastName={userInChat[0].lastName} email={userInChat[0].email}
                                                />
                                                :
                                                <>
                                                    <div className='h-75 overflow-scroll' id='messageContainer'>
                                                        {
                                                            roomData && roomData[roomId] ?
                                                                roomData[roomId].messages.map((message, index) => (
                                                                    <div className={message.userId === user.id ? 'm-2 d-flex justify-content-end' : 'm-2'} key={index}>
                                                                        <div className='bg-white rounded w-con p-2 pe-4'>
                                                                            <p className='m-0 text-primary'>{message.userId === user.id ? 'Me' : userInChat[0].firstName}</p>
                                                                            <p className='m-0'>{message.message}</p>
                                                                        </div>
                                                                    </div>
                                                                )) : null
                                                        }
                                                        <div ref={messageContainer}></div>
                                                    </div>

                                                    <div>
                                                        <ChatScreenMessageInputComp sendMessage={sendMessage} textMessage={textMessage} />
                                                    </div>
                                                </>
                                        }
                                    </>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChatScreen;
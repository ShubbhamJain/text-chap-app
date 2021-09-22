import { React, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { io } from 'socket.io-client'
import { PATHS } from '../../../config';
import { chatUserDropDownMenu, clearAuth, getAuthInfo, userDropDownMenu } from '../../../utils';
import ChatScreenMessageInputComp from '../ChatScreenMessageInputComp/ChatScreenMessageInputComp';
import ChatUsersComp from '../ChatUsersComp/ChatUsersComp';
import UserInfoComp from '../UserInfoComp/UserInfoComp';

const ChatScreen = () => {
    const history = useHistory();

    const textMessage = useRef();
    const socketRef = useRef(null);

    const [userInChat, setUserInChat] = useState([]);
    const [loggedInUsers, setLoggedInUsers] = useState([]);
    const [roomData, setRoomData] = useState({});
    const [roomId, setRoomId] = useState('');

    const user = getAuthInfo().user;

    useEffect(() => {
        return () => {
            socketRef.current.disconnect();
            socketRef.current = null;
            setUserInChat([]);
            setLoggedInUsers([]);
            setRoomData([]);
        }
    }, []);

    useEffect(() => {
        socketRef.current = io.connect('http://localhost:5000/', { transports: ['websocket'], upgrade: false });

        // When user logs in
        socketRef.current.emit('user-logged-in', user.id);

        // We show logged in users in the panel to the newly logged in user
        socketRef.current.on('logged-in-users', loggedInUsrs => {
            setLoggedInUsers(loggedInUsrs);
        });

        // When a new user logs in and joins the chat, we inform other users in chat about the new user
        socketRef.current.on('new-logged-in-user', newLoggedInUsr => {
            let found = false;

            loggedInUsers.forEach(usr => {
                if (newLoggedInUsr.id === usr.id) {
                    return found = true;
                }
            });

            if (found === false) setLoggedInUsers([...loggedInUsers, newLoggedInUsr]);
        });

        // User logs out
        socketRef.current.on('logout', userLoggedOut => {
            setLoggedInUsers(curr => curr.filter(usr => usr.id !== userLoggedOut.id));
            console.log(loggedInUsers);
        });

        // User disconnects
        socketRef.current.on('user-disconnected', loggedInUsrs => {
            setLoggedInUsers(loggedInUsrs);
        });

        socketRef.current.on('room created for sender', (rId, rData) => {
            setRoomData({ ...roomData, [rId]: { ...rData } });
            setRoomId(rId);
        });

        socketRef.current.on('room created for receiver', (receiverInChatWithId, rId, rData) => {
            if (receiverInChatWithId === rId) {
                setRoomData({ ...roomData, [rId]: { ...rData } });
                setRoomId(receiverInChatWithId);
            }
        });

        socketRef.current.on('message received by sender', (rId, msgObj) => {
            setRoomData(curr => ({
                ...curr,
                [rId]: { ...curr[rId], messages: [...curr[rId].messages, msgObj] }
            }));
            setRoomId(rId);
        });

        socketRef.current.on('message received by receiver', (receiverInChatWithId, rId, msgObj) => {
            if (receiverInChatWithId === rId) {
                setRoomData(curr => ({
                    ...curr,
                    [rId]: { ...curr[rId], messages: [...curr[rId].messages, msgObj] }
                }));
                setRoomId(receiverInChatWithId);
            }
        });

        socketRef.current.on('error in chating', msg => {
            console.log(msg);
        });

        socketRef.current.on('error', (error) => {
            console.log(error);
        });
    }, [loggedInUsers, roomId, roomData, user]);

    const setChatUser = ({ id, profilePic, firstName, lastName, email, socketId }) => {
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
            socketRef.current.emit('join room', user.id, id);
        }
    };

    const sendMessage = (event) => {
        event.preventDefault();

        if (textMessage.current.value) {
            let roomID;

            for (const property in roomData) {
                if ((user.id === roomData[property].userOne && userInChat[0].id === roomData[property].userTwo) ||
                    (user.id === roomData[property].userTwo && userInChat[0].id === roomData[property].userOne)) {
                    roomID = property;
                }
            }

            socketRef.current.emit('message sent', textMessage.current.value, roomID, user.id, userInChat[0].id);
            textMessage.current.value = '';
        }
    }

    const onClickHandler = (item) => {
        if (item === 'Logout') {
            socketRef.current.emit('user-logged-out', user);
            clearAuth();
            history.push(PATHS.HOME);
        }
    }

    return (
        <div className='container-fluid px-5 h-100'>
            <div className='row justify-content-center py-md-5 h-100'>
                <div className='col-10 col-md-4 order-2 order-md-1 p-0 fill overflow-auto mt-2 mt-md-0 border h-100'>
                    <div className='sticky-top'>
                        <UserInfoComp picClass='userInfoImage' profilePic={user.profilePic}
                            onClickHandler={onClickHandler} email={user.email} dropDownMenu={userDropDownMenu}
                        >
                        </UserInfoComp>
                    </div>

                    <div>
                        {
                            (loggedInUsers.length === 0 || (loggedInUsers.length === 1 && loggedInUsers[0].id === user.id)) ?
                                <p className='text-center fs-4' style={{ marginTop: '50%' }}>No Users available to chat</p>
                                :
                                loggedInUsers.map((chatUser, index) => {
                                    return chatUser.id === user.id ? null :
                                        (
                                            <ChatUsersComp key={index} id={chatUser.id} picClass='chatUsersImg' profilePic={chatUser.profilePic}
                                                firstName={chatUser.firstName} lastName={chatUser.lastName} email={chatUser.email} socketId={chatUser.socketId}
                                                setChatUser={setChatUser} lastMessageFrom='You' lastMessage='Hello'
                                            />
                                        )
                                })
                        }
                    </div>
                </div>

                <div className='col-10 col-md-7 order-1 order-md-2 p-0 fill bg-cyan position-relative h-100'>
                    {
                        userInChat.length === 0 ?
                            <p className='text-center fs-4' style={{ marginTop: '50%' }}>Select User To Chat</p>
                            :
                            <>
                                <div className='sticky-top'>
                                    <UserInfoComp picClass='chatUserInfoImage' profilePic={userInChat[0].profilePic}
                                        firstName={userInChat[0].firstName} lastName={userInChat[0].lastName} email={userInChat[0].email}
                                        onclinClickHandler={onClickHandler} dropDownMenu={chatUserDropDownMenu}>
                                    </UserInfoComp>
                                </div>

                                <div className='h-75 overflow-scroll'>
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
                                </div>

                                <div>
                                    <ChatScreenMessageInputComp sendMessage={sendMessage} textMessage={textMessage} />
                                </div>
                            </>
                    }
                </div>
            </div>
        </div>
    )
}

export default ChatScreen;
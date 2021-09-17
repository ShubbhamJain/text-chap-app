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
    const [message, setMessage] = useState(null);
    const [loggedInUsers, setLoggedInUsers] = useState([]);
    const [roomData, setRoomData] = useState({});

    const user = getAuthInfo().user;

    useEffect(() => {
        return () => {
            socketRef.current.disconnect();
            socketRef.current = null;
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
            console.log(62);
            setLoggedInUsers(loggedInUsrs);
        });

        socketRef.current.on('message-sent', roomId => {
            console.log(roomId);

            if (Object.keys(roomData).includes(roomId)) {
                setRoomData(curr => curr[roomId]['messages'].push({ [user.id]: message.messageSent }));
            } else {
                setRoomData({
                    ...roomData,
                    [roomId]: {
                        userOne: user.id,
                        userTwo: message.chatUserId,
                        messages: [{
                            [user.id]: message.messageSent
                        }]
                    }
                });
            }

            console.log(roomData);
        });

        socketRef.current.on('message-received', (roomId, userId, chatUserId, message) => {
            console.log(roomId, userId, chatUserId, message); //roomId, userId, userId2, messages(Array) -> { userId: message }

            if (Object.keys(roomData).includes(roomId)) {
                setRoomData(curr => curr[roomId]['messages'].push({ userId: message }));
            } else {
                setRoomData({
                    ...roomData,
                    [roomId]: {
                        userOne: userId,
                        userTwo: chatUserId,
                        messages: [{
                            [userId]: message
                        }]
                    }
                });
            }

            console.log(roomData);
        });

        // user receives a message from private chat
        // socketRef.current.on('receive-message', (message, usr) => {
        //     setMessages([...messages, { ...usr, message }]);
        // });
    }, [loggedInUsers, message, roomData, user]);

    const sendMessage = (event) => {
        event.preventDefault();

        if (textMessage.current.value) {
            setMessage({ chatUserId: [userInChat[0].id], messageSent: textMessage.current.value });
            socketRef.current.emit('join room', textMessage.current.value, user.id, userInChat[0].id);
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

    const setChatUser = ({ id, profilePic, firstName, lastName, email, socketId }) => {
        setUserInChat([{ id, profilePic, firstName, lastName, email, socketId }]);
        // socketRef.current.emit('join room', textMessage.current.value, user);
    };

    return (
        <div className='container-fluid px-5 h-100'>
            <div className='row justify-content-center py-md-5 h-100'>
                <div className='col-10 col-md-4 order-2 order-md-1 p-0 fill overflow-auto mt-2 mt-md-0 border h-100'>
                    <div className='sticky-top'>
                        <UserInfoComp picClass='userInfoImage' profilePic={user.profilePic} onClickHandler={onClickHandler} email={user.email} dropDownMenu={userDropDownMenu} >
                        </UserInfoComp>
                    </div>

                    <div>
                        {
                            // eslint-disable-next-line eqeqeq
                            (loggedInUsers.length === 0 || (loggedInUsers.length === 1 && loggedInUsers[0].id == user.id)) ?
                                <p className='text-center fs-4' style={{ marginTop: '50%' }}>No Users available to chat</p>
                                :
                                loggedInUsers.map((chatUser, index) => {
                                    // eslint-disable-next-line eqeqeq
                                    return chatUser.id == user.id ? null :
                                        (
                                            <ChatUsersComp key={index} id={chatUser.id} picClass='chatUsersImg' profilePic={chatUser.profilePic} firstName={chatUser.firstName} lastName={chatUser.lastName} email={chatUser.email} socketId={chatUser.socketId} setChatUser={setChatUser} lastMessageFrom='You' lastMessage='Hello' />
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
                                    <UserInfoComp picClass='chatUserInfoImage' profilePic={userInChat[0].profilePic} firstName={userInChat[0].firstName} lastName={userInChat[0].lastName} email={userInChat[0].email} onclinClickHandler={onClickHandler} dropDownMenu={chatUserDropDownMenu}>
                                    </UserInfoComp>
                                </div>

                                <div className='h-75 overflow-scroll'>
                                    {console.log(roomData)}
                                    {
                                        // messages.map((message, index) => (
                                        //     <div className={message.id === user.id ? 'm-2 d-flex justify-content-end' : 'm-2'} key={index}>
                                        //         <div key={index} className='bg-white rounded w-con p-2 pe-4'>
                                        //             <p className='m-0 text-primary'>{message.id === user.id ? 'Me' : message.firstName}</p>
                                        //             <p className='m-0'>{message.message}</p>
                                        //         </div>
                                        //     </div>
                                        // ))
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
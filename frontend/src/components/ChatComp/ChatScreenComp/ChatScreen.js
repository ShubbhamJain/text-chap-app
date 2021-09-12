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
    const [messages, setMessages] = useState([]);
    const [loggedInUsers, setLoggedInUsers] = useState([]);

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

        // We show logged in users in the panel
        socketRef.current.on('logged-in-users', loggedInUsrs => {
            setLoggedInUsers(loggedInUsrs);
        });

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

        socketRef.current.on('receive-message', (message, usr) => {
            setMessages([...messages, { ...usr, message }]);
        });
    }, [loggedInUsers, messages, user]);

    const sendMessage = (event) => {
        event.preventDefault();

        if (textMessage.current.value) {
            socketRef.current.emit('join room', textMessage.current.value, userInChat[0].socketId);
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

    const setChatUser = ({ profilePic, firstName, lastName, email, socketId }) => {
        setUserInChat([{ profilePic, firstName, lastName, email, socketId }]);
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
                        {console.log(loggedInUsers)}
                        {
                            // eslint-disable-next-line eqeqeq
                            (loggedInUsers.length === 0 || (loggedInUsers.length === 1 && loggedInUsers[0].id == user.id)) ?
                                <p className='text-center fs-4' style={{ marginTop: '50%' }}>No Users available to chat</p>
                                :
                                loggedInUsers.map((chatUser, index) => {
                                    // eslint-disable-next-line eqeqeq
                                    return chatUser.id == user.id ? null :
                                        (
                                            <ChatUsersComp key={index} picClass='chatUsersImg' profilePic={chatUser.profilePic} firstName={chatUser.firstName} lastName={chatUser.lastName} email={chatUser.email} socketId={chatUser.socketId} setChatUser={setChatUser} lastMessageFrom='You' lastMessage='Hello' />
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
                                    {
                                        messages.map((message, index) => (
                                            <div className={message.id === user.id ? 'm-2 d-flex justify-content-end' : 'm-2'} key={index}>
                                                <div key={index} className='bg-white rounded w-con p-2 pe-4'>
                                                    <p className='m-0 text-primary'>{message.id === user.id ? 'Me' : message.firstName}</p>
                                                    <p className='m-0'>{message.message}</p>
                                                </div>
                                            </div>
                                        ))
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
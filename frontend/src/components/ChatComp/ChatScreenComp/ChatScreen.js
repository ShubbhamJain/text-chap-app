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
    const imgUrl = 'https://images.pexels.com/photos/2726111/pexels-photo-2726111.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500';

    useEffect(() => {
        socketRef.current = io.connect('http://localhost:5000/');

        socketRef.current.emit('user-logged-in', user);

        socketRef.current.on('logged-in-users', loggedInUsers => {
            setLoggedInUsers(loggedInUsers);
        });

        socketRef.current.on("reconnect", (attempt) => {
            console.log(attempt);
        });
    }, [user]);

    useEffect(() => {
        socketRef.current.on('receive-message', (message, user) => {
            setMessages([...messages, { ...user, message }]);
        });
    }, [messages]);

    const sendMessage = (event) => {
        event.preventDefault();

        if (textMessage.current.value) {
            socketRef.current.emit('join room', textMessage.current.value, user);
            textMessage.current.value = '';
        }
    }

    const onClickHandler = (item) => {
        if (item === 'Logout') {
            clearAuth();
            history.replace(PATHS.HOME);
        }
    }

    return (
        <div className='container-fluid px-5 h-100'>
            <div className='row justify-content-center py-md-5 h-100'>
                <div className='col-10 col-md-4 order-2 order-md-1 p-0 fill overflow-auto mt-2 mt-md-0 border h-100'>
                    <div className='sticky-top'>
                        <UserInfoComp picClass='userInfoImage' profilePic={user.profilePic} onclonClickHandler={onClickHandler} email={user.email} dropDownMenu={userDropDownMenu} >
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
                                            <ChatUsersComp key={index} picClass='chatUsersImg' profilePic={chatUser.profilePic} firstName={chatUser.firstName} lastName={chatUser.lastName} lastMessageFrom='You' lastMessage='Hello' />
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
                                    <UserInfoComp picClass='chatUserInfoImage' profilePic={imgUrl} onclonClickHandler={onClickHandler} firstName={user.firstName} lastName={user.lastName} email={user.email} dropDownMenu={chatUserDropDownMenu}>
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
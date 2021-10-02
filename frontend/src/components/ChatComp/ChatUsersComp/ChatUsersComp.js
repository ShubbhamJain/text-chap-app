import { React } from 'react';

const ChatUsersComp = ({ id, picClass, profilePic, firstName, lastName, email, socketId, setChatUser, lastMessageFrom, lastMessage, notifications, ...props }) => {
    return (
        <>
            <div className='d-flex flex-row align-items-center chatUser' onClick={() => setChatUser({ id, profilePic, firstName, lastName, email, socketId })}>
                <img className={`${picClass} me-3`} src={profilePic} alt='ProfilePic' />
                <div className='d-flex flex-column flex-grow-1'>
                    <h5 className='mb-1'>{firstName} {lastName}</h5>
                    <p className='m-0'>{lastMessageFrom}: {lastMessage}</p>
                </div>

                {
                    notifications.length ? notifications.map((notification, index) => (
                        notification === id ? (
                            <div key={index}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="green" className="bi bi-dot d-inline" viewBox="0 0 16 16">
                                    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                                </svg>
                            </div>
                        ) : null
                    )) : null
                }
            </div>
            <hr className='m-0' />
        </>
    )
}

export default ChatUsersComp;
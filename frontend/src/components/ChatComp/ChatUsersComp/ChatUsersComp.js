import { React } from 'react';

const ChatUsersComp = ({ picClass, profilePic, firstName, lastName, lastMessageFrom, lastMessage, ...props }) => {
    return (
        <>
            <div className='d-flex flex-row align-items-center chatUser'>
                <img className={`${picClass} me-3`} src={profilePic} alt='ProfilePic' />
                <div className='d-flex flex-column'>
                    <h5 className='mb-1'>{firstName} {lastName}</h5>
                    <p className='m-0'>{lastMessageFrom}: {lastMessage}</p>
                </div>
            </div>
            <hr className='m-0' />
        </>
    )
}

export default ChatUsersComp;
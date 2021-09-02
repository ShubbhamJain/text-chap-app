import { React } from 'react';

const ChatScreenMessageInputComp = ({ sendMessage, textMessage, ...props }) => {
    return (
        <div className='p-3 m-0 bg-grey position-absolute bottom-0 w-100'>
            <form onSubmit={sendMessage} className='d-flex row-flex'>
                <section className='flex-fill w-100 me-2'>
                    <input type='text' className='form-control' placeholder='Enter a message...' ref={textMessage} id='messageInput' aria-describedby='messageInput' />
                </section>
                <section className='flex-fill'>
                    <button type="submit" className="btn btn-primary">Send</button>
                </section>
            </form>
        </div>
    )
}

export default ChatScreenMessageInputComp;
import React from 'react';

const Toast = props => {
    const { title, description } = props;

    return (
        <>
            <div>
                <p className='m-1 fs-6'>{title}</p>
                <p className='m-1 fs-6'>{description}</p>
            </div>
        </>
    );
}

export default Toast;
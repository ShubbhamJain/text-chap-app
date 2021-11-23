import { React } from 'react';

const MyDetails = ({ profilePic, firstName, lastName, email, ...props }) => {
    return (
        <div className='container-fluid py-1 text-center mt-5 pt-5'>
            <section className='bg-grey rounded py-5 position-relative'>
                <img className='img-fluid rounded-circle position-absolute top-0 start-50 translate-middle' style={{ objectFit: 'cover', width: '150px', height: '150px' }} src={profilePic} alt='Profile pic' />
                <p className='fs-5 mt-5'>{firstName} {lastName}</p>
                <p className='fs-5 m-0'>{email}</p>
            </section>
        </div>
    )
}

export default MyDetails;
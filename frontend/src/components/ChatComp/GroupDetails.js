import { React } from 'react';
import { apiUrl } from '../../utils';

const GroupDetails = ({ groupImg, groupName, groupUsers, ...props }) => {
    return (
        <div className='container-fluid py-1 mt-5 pt-5'>
            <section className='bg-grey rounded pt-5 pb-2 position-relative text-center'>
                <img className='img-fluid rounded-circle position-absolute top-0 start-50 translate-middle' style={{ objectFit: 'cover', width: '150px', height: '150px' }} src={groupImg} alt='Profile pic' />
                <p className='fs-5 mt-5'>{groupName}</p>
            </section>

            <section className='mt-5'>
                <p className='fs-4'>Users</p>
                {
                    groupUsers.map((usr, index) => {
                        return (
                            <div key={index}>
                                <div className='d-flex align-items-center'>
                                    <img className='img-fluid chatUsersImg' style={{ objectFit: 'cover', width: '75px', height: '75px' }} src={`${apiUrl}/group/groupImg/${usr.profilePic}`} alt='Profile Pic' />
                                    <p className='m-0'>{usr.firstName} {usr.lastName}</p>
                                </div>
                                <hr className='m-0' />
                            </div>
                        )
                    })
                }
            </section>
        </div>
    )
}

export default GroupDetails;
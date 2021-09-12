import { React } from 'react';
import UserInfoDropDownComp from '../UserInfoDropDownComp/UserInfoDropDownComp';
import './UserInfoComp.scss';

const UserInfoComp = ({ picClass, profilePic, firstName, lastName, email, onClickHandler, dropDownMenu, ...props }) => {
    return (
        <div className='container-fluid py-1 bg-grey'>
            <div className='d-flex flex-row align-items-center'>
                <section className={`${picClass} me-4`}>
                    <img className='img-fluid' src={profilePic} alt='Profile Pic' />
                </section>

                {
                    firstName && lastName ? <section><p className='d-inline'>{firstName} {lastName}</p></section> : null
                }

                <section className=' d-block ms-auto dropdown'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-three-dots-vertical d-flex ms-auto dropdown-toggle" viewBox="0 0 16 16" id="userInfoDropDownMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                    </svg>
                    <UserInfoDropDownComp onClickHandler={onClickHandler} dropDownMenu={dropDownMenu} />
                </section>
            </div>
        </div>
    )
}

export default UserInfoComp;
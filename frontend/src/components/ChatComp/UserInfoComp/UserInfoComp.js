import { React } from 'react';
import UserInfoDropDownComp from '../UserInfoDropDownComp/UserInfoDropDownComp';
import './UserInfoComp.scss';

const UserInfoComp = ({ picClass, profilePic, firstName, lastName, email, onClickHandler, dropDownMenu, toggleDetails, showDetails, detailsSelection, ...props }) => {
    return (
        <div className='container-fluid py-1 bg-grey'>
            <div className='d-flex flex-row align-items-center'>
                {
                    detailsSelection ?
                        'My profile' && showDetails ?
                            <p className='my-4 pointer fs-5' onClick={() => toggleDetails(detailsSelection)}>{`< Go Back`}</p>
                            :

                            <section className={`${picClass} me-4 pointer`} onClick={() => toggleDetails(detailsSelection)}>
                                <img className='img-fluid' style={{ objectFit: 'cover', width: '100px', height: '75px' }} src={profilePic} alt='Profile Pic' />
                            </section>
                        : 'Details' && showDetails ?
                            <p className='my-4 pointer fs-5' onClick={() => toggleDetails(detailsSelection)}>{`< Go Back`}</p>
                            :

                            <section className={`${picClass} me-4 pointer`} onClick={() => toggleDetails(detailsSelection)}>
                                <img className='img-fluid' style={{ objectFit: 'cover', width: '100px', height: '75px' }} src={profilePic} alt='Profile Pic' />
                            </section>
                }

                {
                    detailsSelection === 'Details' && !showDetails ? (firstName && lastName ? <section><p className='d-inline'>{firstName} {lastName}</p></section> : null) : null
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
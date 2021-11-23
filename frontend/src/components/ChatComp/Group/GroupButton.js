import React from 'react';

const GroupButton = ({ loggedInUsers, user, groupImgRef, groupName, setGroupName, groupUsers, updateGroup, createGroup, groupUserSelectionRef, showGroups, handleShowGroup, handleGroupImg, checkGroupImg, ...props }) => {
    return (
        <>
            <div className='w-100 d-flex justify-content-between align-items-center'>
                <div className='px-0 py-3 mx-2 text-primary pointer'>
                    <p className='m-0 fs-6' onClick={handleShowGroup}>
                        {showGroups ? '< User Chats' : 'Chat Groups >'}
                    </p>
                </div>

                {
                    (loggedInUsers.length === 0 || loggedInUsers.length === 2 || (loggedInUsers.length === 1 && loggedInUsers[0].id === user.id)) ?
                        null
                        :
                        <div className='px-0 py-3 mx-2 d-flex align-items-center text-primary pointer' data-bs-toggle='modal' data-bs-target='#createGroupModal'>
                            <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' className='bi bi-pencil-square' viewBox='0 0 16 16'>
                                <path d='M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z' />
                                <path fillRule='evenodd' d='M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z' />
                            </svg>
                            <p className='m-0 fs-6 ms-2'>Create Group</p>
                        </div>
                }
            </div>
            <hr className='m-0' />

            <div className='modal fade' id='createGroupModal' tabIndex='-1' aria-labelledby='createGroupModalLabel' aria-hidden='true'>
                <div className='modal-dialog'>
                    <div className='modal-content rounded'>
                        <div className='modal-header'>
                            <h5 className='modal-title' id='createGroupModalLabel'>Create Group</h5>
                            <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
                        </div>
                        <div className='modal-body p-0'>
                            <div className="mx-3 my-4 mt-2">
                                <label htmlFor="formFile" className="form-label">Upload Group Image</label>
                                <input className="form-control" type="file" id="formFile" formEncType='multipart/form-data'
                                    ref={groupImgRef} onInput={handleGroupImg}
                                />
                            </div>

                            <div className='form-floating mx-3 my-4'>
                                <input type='text' className='form-control' id='groupName' placeholder='Enter Group Name' onChange={el => setGroupName(el.target.value)} />
                                <label htmlFor='groupName'>Enter Group Name</label>
                            </div>
                            <hr className='m-0' />

                            {
                                loggedInUsers.map((chatUser, index) => {
                                    return chatUser.id === user.id ? null :
                                        <div key={index}>
                                            <div className='form-check mx-3 py-3 d-flex align-items-center'>
                                                <input className='form-check-input' type='checkbox' id='flexCheckDefault' ref={el => groupUserSelectionRef.current[index] = el} onChange={(e) => updateGroup(e, chatUser)} />
                                                <label className='form-check-label m-0 fs-6 ms-2' htmlFor='flexCheckDefault'>
                                                    {chatUser.firstName} {chatUser.lastName}
                                                </label>
                                            </div>
                                            <hr className='m-0' />
                                        </div>
                                })
                            }

                            <div className='d-flex justify-content-end py-3 me-3'>
                                <button type='button' className='btn btn-secondary me-2' data-bs-dismiss='modal'>Close</button>
                                <button type='button' className='btn btn-primary' onClick={createGroup} data-bs-dismiss='modal' disabled={checkGroupImg === false || groupUsers.length < 2 || groupName.length <= 0}>Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default GroupButton;
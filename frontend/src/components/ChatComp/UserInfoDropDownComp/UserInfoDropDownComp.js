import { React } from 'react';

const UserInfoDropDownComp = ({ dropDownMenu, onClickHandler, ...props }) => {
    return (
        <ul className="dropdown-menu p-2" aria-labelledby="userInfoDropDownMenu">

            {
                dropDownMenu.map((item, index) => {
                    return (
                        <li className="dropdown-item pointer" key={index} onClick={() => onClickHandler(item)}>{item}</li>
                    )
                })
            }
        </ul>
    )
}

export default UserInfoDropDownComp;
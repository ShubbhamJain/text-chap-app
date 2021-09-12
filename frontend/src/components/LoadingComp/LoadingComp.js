import React from "react";
import './LoadingComp.scss'

const LoadingComp = () => {
    return (
        <div className='contain'>
            <div className='h-50 d-flex justify-content-center align-items-end'>
                <div className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </div>
    )
}

export default LoadingComp;
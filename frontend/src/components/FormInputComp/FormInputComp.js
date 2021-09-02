import React from 'react';

const FormInput = ({ name, type, placeholder, inputHandler, className, label, refValue, error, errorClassName, ...props }) => {

    return (
        <React.Fragment>
            <div className='form-floating'>
                <input type={type} className={className} id={name} placeholder={placeholder}
                    ref={refValue} onInput={() => inputHandler(refValue, name)}>
                </input>
                <label htmlFor={name}>{label}</label>
            </div>
            {error && <section className={errorClassName}>{error}</section>}
        </React.Fragment>
    )
}

export default FormInput;
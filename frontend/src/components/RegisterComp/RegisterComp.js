import { React, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { lANG, PATHS } from '../../config';
import { registerCall } from '../../config/apiCalls';
import { emailError, emailRegexCheck, firstNameError, lastNameError, passwordError, passwordRegexCheck, profilepic } from '../../utils';
import FormInput from '../FormInputComp/FormInputComp';
import './RegisterComp.scss';

const RegisterComp = () => {
    const history = useHistory();

    const profilePicRef = useRef();
    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();

    const [btn, setBtn] = useState(true);

    const [errorMsg, setErrorMsg] = useState({
        formFile: null,
        firstname: null,
        lastname: null,
        email: null,
        password: null
    });

    const [formErrorMsg, setFormErrorMsg] = useState('Please enter all details');
    const [showFormErrorMsg, setShowFormErrorMsg] = useState(false);
    const formErrorMsgClass = 'mb-4 d-block text-danger border border-danger rounded py-2 text-center bg-danger bg-opacity-10';

    const inputHandler = (ref, elem) => {
        switch (elem) {
            case 'formFile':
                !ref.current.files[0] ? setErrorMsg({ ...errorMsg, formFile: profilepic }) : setErrorMsg({ ...errorMsg, formFile: false });;
                break;
            case 'firstname':
                ref.current.value.length === 0 ?
                    setErrorMsg({ ...errorMsg, firstname: firstNameError }) : setErrorMsg({ ...errorMsg, firstname: false });
                break;
            case 'lastname':
                ref.current.value.length === 0 ?
                    setErrorMsg({ ...errorMsg, lastname: lastNameError }) : setErrorMsg({ ...errorMsg, lastname: false });
                break;
            case 'email':
                !emailRegexCheck(ref.current.value) ?
                    setErrorMsg({ ...errorMsg, email: emailError }) : setErrorMsg({ ...errorMsg, email: false });
                break;
            case 'password':
                !passwordRegexCheck(ref.current.value) ?
                    setErrorMsg({ ...errorMsg, password: passwordError }) : setErrorMsg({ ...errorMsg, password: false });
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        if (profilePicRef.current.files[0] && firstNameRef.current.value && lastNameRef.current.value && emailRegexCheck(emailRef.current.value) && passwordRegexCheck(passwordRef.current.value)) {
            if (Object.values(errorMsg).every(value => value === false)) {
                setBtn(false);
            }
            else {
                setBtn(true);
            }
        } else {
            setBtn(true);
        }
    }, [errorMsg]);

    const submitForm = async (event) => {
        event.preventDefault();

        const registerFormData = new FormData();

        registerFormData.append('profilePic', profilePicRef.current.files[0]);
        registerFormData.append('firstName', firstNameRef.current.value);
        registerFormData.append('lastName', lastNameRef.current.value);
        registerFormData.append('email', emailRef.current.value);
        registerFormData.append('password', passwordRef.current.value);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }

        const response = await registerCall(registerFormData, config);

        if (response.error) {
            setShowFormErrorMsg(true);
            setFormErrorMsg(response.message);
            setTimeout(() => { setShowFormErrorMsg(false) }, 2000);
        } else {
            history.push(PATHS.CHAT);
        }
    }

    return (
        <div className="container-fluid h-100">
            <div className='row justify-content-center align-items-center h-100'>
                <div className='col-sm-7 col-md-6 col-lg-5 bg-white p-5 shadow-lg border border-white rounded'>
                    <h3 className='mb-5 text-center'>{lANG.register.Heading}</h3>
                    <form className="form-container" onSubmit={submitForm}>
                        <section className={showFormErrorMsg ? formErrorMsgClass : 'd-none'}>{formErrorMsg}</section>

                        <div className="mb-4">
                            <label htmlFor="formFile" className="form-label">Upload profile picture</label>
                            <input className="form-control" type="file" id="formFile" formEncType='multipart/form-data'
                                ref={profilePicRef} onInput={() => inputHandler(profilePicRef, 'formFile')}
                            />
                            {errorMsg['formFile'] && <section className='text-danger'>{errorMsg['formFile']}</section>}
                        </div>

                        <div className='row mb-4'>
                            <div className='col-xs-12 col-sm-6'>
                                <FormInput name='firstname' type='text' className='form-control' placeholder='John' error={errorMsg['firstname']}
                                    errorClassName='text-danger' refValue={firstNameRef} inputHandler={inputHandler} label={lANG.register.FirstName}>
                                </FormInput>
                            </div>
                            <div className='col-xs-12 col-sm-6'>
                                <FormInput name='lastname' type='text' className='form-control' placeholder='snow' error={errorMsg['lastname']}
                                    errorClassName='text-danger' refValue={lastNameRef} inputHandler={inputHandler} label={lANG.register.LastName}>
                                </FormInput>
                            </div>
                        </div>

                        <section className='mb-4'>
                            <FormInput name='email' type='email' className='form-control' placeholder='email' error={errorMsg['email']}
                                errorClassName='text-danger' refValue={emailRef} inputHandler={inputHandler} label={lANG.register.Email}>
                            </FormInput>
                        </section>

                        <section className='mb-5'>
                            <FormInput name='password' type='password' className='form-control' placeholder='pwd' error={errorMsg['password']}
                                errorClassName='text-danger' refValue={passwordRef} inputHandler={inputHandler} label={lANG.register.Password}>
                            </FormInput>
                        </section>

                        <div className='row justify-content-between'>
                            <div className='col-5 align-self-center'>
                                <p id='loginText' className="text-primary m-0 d-inline" onClick={() => history.push(PATHS.LOGIN)}>{lANG.register.login}</p>
                            </div>
                            <div className='col-5 d-flex justify-content-end'>
                                <button type="submit" className="btn btn-primary" disabled={btn}>{lANG.register.submit}</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default RegisterComp;
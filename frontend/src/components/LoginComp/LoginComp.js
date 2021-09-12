import { React, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { lANG, PATHS } from '../../config';
import { checkUserCall, loginCall } from '../../config/apiCalls';
import { clearAuth, emailError, emailRegexCheck, errorMsgClass, isAuthenticated, passwordError, passwordRegexCheck } from '../../utils';
import FormInput from '../FormInputComp/FormInputComp';
import LoadingComp from '../LoadingComp/LoadingComp';
import './LoginComp.scss'

const LoginComp = () => {
    const history = useHistory();

    const emailRef = useRef();
    const passwordRef = useRef();

    const [btn, setBtn] = useState(true);
    const isLoggedIn = isAuthenticated();
    const [showLogin, setShowLogin] = useState(false);
    const [errorMsg, setErrorMsg] = useState({
        email: null,
        password: null
    });
    const [formErrorMsg, setFormErrorMsg] = useState('Please enter all details');
    const [showFormErrorMsg, setShowFormErrorMsg] = useState(false);

    const formErrorMsgClass = errorMsgClass;

    const inputHandler = (ref, elem) => {
        switch (elem) {
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
        async function func() {
            if (isLoggedIn === false) {
                setShowLogin(true);
            } else {
                const value = await checkUserCall();

                if (value === true) {
                    setShowLogin(false);
                    history.replace(PATHS.CHAT);
                } else {
                    setShowLogin(true);
                    clearAuth();
                }
            }
        }
        func();
    }, [history, isLoggedIn]);

    useEffect(() => {
        if (emailRef.current && passwordRef.current) {
            if (emailRegexCheck(emailRef.current.value) && passwordRegexCheck(passwordRef.current.value)) {
                if (Object.values(errorMsg).every(value => value === false)) {
                    setBtn(false);
                }
                else {
                    setBtn(true);
                }
            } else {
                setBtn(true);
            }
        }
    }, [errorMsg]);

    const submitForm = async (event) => {
        event.preventDefault();

        const body = {
            email: emailRef.current.value,
            password: passwordRef.current.value
        }

        const response = await loginCall(body);

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
            {
                showLogin ?
                    (
                        <div className='row justify-content-center align-items-center h-100'>
                            <div className='col-sm-7 col-md-6 col-lg-5 bg-white p-5 shadow-lg border border-white rounded'>
                                <h3 className='mb-5 text-center'>{lANG.login.Heading}</h3>
                                <form className="form-container" onSubmit={submitForm}>
                                    <section className={showFormErrorMsg ? formErrorMsgClass : 'd-none'}>{formErrorMsg}</section>

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
                                            <p id='registerText' className="text-primary m-0 d-inline" onClick={() => history.push(PATHS.REGISTER)}>{lANG.login.register}</p>
                                        </div>
                                        <div className='col-5 d-flex justify-content-end'>
                                            <button type="submit" className="btn btn-primary" disabled={btn}>{lANG.login.submit}</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                    : <LoadingComp />
            }
        </div>
    )
}

export default LoginComp;
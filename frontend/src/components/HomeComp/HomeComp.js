import { React } from 'react';
import { lANG, PATHS } from '../../config';
import './HomeComp.scss';
import homePhoneImg from '../../assets/HomePhoneImg.webp';

const HomeComp = () => {
    return (
        <div>
            <nav className='navbar navbar-expand-lg navbar-dark text-uppercase bg-green'>
                <div className='container-fluid px-md-5 mx-md-5'>
                    <a className='navbar-brand fs-3 text-white' href='/'>{lANG.home.Heading}</a>
                    <button className='navbar-toggler border-0 shadow-none' type='button' data-bs-toggle='collapse' data-bs-target='#navbarToggle' aria-controls='navbarToggle' aria-expanded='false' aria-label='Toggle navigation'>
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className='collapse navbar-collapse' id='navbarToggle'>
                        <div className='navbar-nav d-flex ms-auto'>
                            <a className="nav-link text-white" href={PATHS.LOGIN}>{lANG.home.login}</a>
                            <a className="nav-link text-white ms-lg-3" href={PATHS.REGISTER}>{lANG.home.register}</a>
                        </div>
                    </div>
                </div>
            </nav>

            <div className='container mt-5'>
                <div className='row justify-content-center align-items-center'>
                    <div className='col-12 col-md-5 col-lg-5 mb-5 mb-md-0'>
                        <div className='fs-2'>
                            <p className='m-0 fw-light'>{lANG.home.content1}</p>
                            <p className='fw-light'>{lANG.home.content2}</p>
                        </div>
                        <p className='fs-5 fw-light'>{lANG.home.content3}</p>
                        <p className='fs-4 fw-light'>{lANG.home.content4}</p>
                    </div>
                    <div className='col-7 col-md-4 col-lg-3'>
                        <img className='img-fluid' src={homePhoneImg} alt='phone img' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomeComp;
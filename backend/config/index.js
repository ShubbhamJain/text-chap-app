const LANG = {
    auth: {
        noToken: 'No token, authorization failed',
        valid: 'Token is not valid'
    },
    register: {
        firstNameErrorMessage: 'Please re-enter first name.',
        lastNameErrorMessage: 'Please re-enter last name.',
        emailErrorMessage: 'Please re-enter email.',
        passwordErrorMessage: 'Please re-enter password.',
        userCheck: 'User already exists, please change details.'
    },
    login: {
        emailErrorMessage: 'Please re-enter email.',
        passwordErrorMessage: 'Please re-enter password.',
        userCheck: 'User does not exist.',
        credentialsCheck: 'Invalid Credentials.'
    }
}

module.exports = { LANG };
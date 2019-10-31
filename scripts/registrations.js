const auth=firebase.auth()

// Registering the User
const user_signup=()=>{
    
    
    const email=signUpForm['signupEmail'].value
    const pwd=signUpForm['signupPassword'].value
    
    // creating account using firebase auth
    auth.createUserWithEmailAndPassword(email, pwd)
    .then(()=>{
        window.location='userDashboard.html'
    })
    .catch(function(error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode,errorMessage)
      });
}

// User Login
const user_login=()=>{
    
    const email=logInForm['loginEmail'].value
    const pwd=logInForm['loginPassword'].value
    
    // login account using firebase auth
    
    auth.signInWithEmailAndPassword(email, pwd)
    .then(()=>{
        window.location='userDashboard.html'
    })
    .catch(function(error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode,errorMessage)
      })

}


const signUpForm=document.querySelector('.signup-form')
const logInForm=document.querySelector('.login-form')

signUpForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    user_signup()
})

logInForm.addEventListener('submit',e=>{
    e.preventDefault()
    user_login()
})
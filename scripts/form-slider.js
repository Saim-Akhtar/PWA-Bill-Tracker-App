const signupToggle=document.getElementById('signupToggle')
const loginToggle=document.getElementById('loginToggle')

const signupForm=document.querySelector('.signup-form')
const loginForm=document.querySelector('.login-form')

const toggleForms=()=>{
    
    signupForm.classList.toggle('show-signup')
    
    loginForm.classList.toggle('hide-login')

}

if(window.location.href.includes('#signup')){
    toggleForms()
}

signupToggle.addEventListener('click',toggleForms)
loginToggle.addEventListener('click',toggleForms)
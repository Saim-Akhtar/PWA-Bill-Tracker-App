const logout=()=>{
    const auth=firebase.auth()
    auth.signOut()
    .then(()=>{
        window.location='index.html'
    })
    .catch(()=>{
        alert('error logging out')
    })
}

const logout_btn=document.querySelector('.logout')
logout_btn.addEventListener('click',logout)
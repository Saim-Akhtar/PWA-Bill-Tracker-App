const db=firebase.firestore()
const billTable=document.getElementById('bill_table')
const downloadBtn=document.getElementById('downloadBtn')
const addBill_form=document.querySelector('#addModal form')
let userID
let userEmail
let username
let userKey
let userDoc


// Save AS Excel File Using Sheets JS on button click
const saveTableAsExcel=()=>{
    var wb = XLSX.utils.table_to_book(billTable, {
        sheet: "Sheet Bills"
    });

    XLSX.writeFile(wb,'tracked bills.xlsx', {
        bookType: 'xlsx',
        bookSST: true,
        type: 'binary'
    });
}

// Adding event listener to download file button
downloadBtn.addEventListener('click',saveTableAsExcel)



// Drawing Chart of monthly bills
const drawChart=()=>{
    var ctx = document.getElementById("billChart").getContext('2d');
    
    const bill_titles=[...billTable.querySelectorAll('.bill-title')]
    const bill_amount=[...billTable.querySelectorAll('.amount')]


    var myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: bill_titles.map(bill=> bill.innerHTML),
            datasets: [{    
                data: bill_amount.map(bill=> bill.innerHTML), // Specify the data values array
            
                borderColor: ['#2196f38c', '#f443368c', '#3f51b570', '#00968896'], // Add custom color border 
                backgroundColor: ['#2196f38c', '#f443368c', '#3f51b570', '#00968896'], // Add custom color background (Points and Fill)
                borderWidth: 1 // Specify bar border width
            }]},         
        options: {
        responsive: true, // Instruct chart js to respond nicely.
        maintainAspectRatio: true, // Add to prevent default behaviour of full-width/height 
        }
    });
}
drawChart()


const displayNoBills=()=>{
    const noBillsHeading=document.createElement('h4')
    noBillsHeading.classList.add('white-text','center')
    noBillsHeading.innerHTML='No Bills'
    const billTable_container=billTable.parentElement
    billTable_container.innerHTML=''
    billTable_container.appendChild(noBillsHeading)
}

//-------------- Managing Data In Firestore --------------------//
const addBillInCollection=(bill)=>{
    console.log(bill)
    userDoc.collection('bills').add(bill) //adding in firestore user bill collection
}

// function used to get data of Bill from FORM
addBill_form.addEventListener('submit',(e)=>{
    e.preventDefault()
    const form=e.target
    const billTitle=form['title-bill'].value
    const billCurrency=form['currency-bill'].value
    const billAmount= form['amount-bill'].value
    const billDueDate=form['dueDate-bill'].value
    addBillInCollection({billTitle,billCurrency,billAmount,billDueDate})
    form.reset()
    $('#addModal').modal('close')
})

// -------------Manipulation of DOM on each event in database ------------ //
const addBillsIntable=(bill)=>{
    const tableBody=billTable.querySelector('tbody')
    const amountHeading=document.querySelector('.amount-heading')
    amountHeading.innerHTML+=`(${bill.data().billCurrency})` // indicate the currency in amount heading in table

    const row=document.createElement('tr')
    row.setAttribute('id',bill.id)
    row.innerHTML=`
        <tr>
        <td><i class="material-icons">more_vert</i></td>
        <td class="bill-title">${bill.data().billTitle}</td>
        <td class="amount">
        <i class="fas fa-${bill.data().billCurrency}-sign"></i> 
        ${bill.data().billAmount}
        </td>
        <td>${bill.data().billDueDate}</td>
        <td>Unpaid</td>
        
        </tr>
    `
    tableBody.appendChild(row)
}






const realTimeBills=async(userDoc)=>{
    
    userDoc.collection('bills').onSnapshot(snapshot => {
        if(snapshot.empty){
            console.log('No Bills Added yet')
            displayNoBills()
            return 
        }
        snapshot.docChanges().forEach(change => {
    
            if (change.type == 'added') {
                addBillsIntable(change.doc)
            } else if (change.type == 'removed') {
                console.log('removed')
            } else if (change.type == 'modified') {
                console.log('updated')
            }
        })
    
    })
}

// Creating a user document in Firestore
const createUser=async()=>{
    db.collection('Users').doc(userKey).set({
        uid: userID,
        email: userEmail
    })
    .then(()=>{
        console.log('successfuly created user')
    })
    .catch((err)=>{
        console.log('Caught an Error : ',err)
    })
    
}

const getUser=async()=>{
    
    userDoc=await db.collection('Users').doc(userKey)
    const doc= await userDoc.get()
    if(doc.exists){
        realTimeBills(userDoc)
    }
    else{
        createUser()
    }
    
    
}

window.onload=()=>{
    firebase.auth().onAuthStateChanged(function(user) {
        
        if (user ) {
          // User is signed in.
        
          userEmail = user.email;
          username=userEmail.slice(0,userEmail.indexOf('@'))
          userID = user.uid;
          userKey=username+userID
          
          getUser()
    
          // ...
        } else{
          // User is signed out.
          // ...
          window.location='index.html'
        }
      })
}

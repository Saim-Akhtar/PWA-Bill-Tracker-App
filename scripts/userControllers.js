const db=firebase.firestore()
// enable offline data
db.enablePersistence()
    .catch(function(err) {
        if (err.code == 'failed-precondition') {
            // probably multible tabs open at once
            console.log('persistance failed');
        } else if (err.code == 'unimplemented') {
            // lack of browser support for the feature
            console.log('persistance not available');
        }
    });

const billCards=document.getElementById('bill-cards')
const downloadBtn=document.getElementById('downloadBtn')
const addBill_form=document.querySelector('#addModal form')
const updateBill_form=document.querySelector('#updateModal form')
let billUpdateKey

let userID
let userEmail
let username
let userKey
let userDoc

// Save AS Excel File Using Sheets JS on button click
const saveTableAsExcel=()=>{

// var wb = XLSX.utils.table_to_book(billCards, {
    //     sheet: "Sheet Bills"
    // });

    const bill_titles=[...billCards.querySelectorAll('.bill-title')]
    const bill_amount=[...billCards.querySelectorAll('.bill-amount')]
    const bill_dueDates=[...billCards.querySelectorAll('.bill-dueDate')]
    const bill_paid=[...billCards.querySelectorAll('.bill-paid')]
    const bill_currency=[...billCards.querySelectorAll('.bill-currency')]

    const ws_data=[]
    for(let i=0; i<bill_titles.length;i++){
        const Title=bill_titles[i].innerHTML
        const Amount=bill_amount[i].innerHTML
        const DueDate=bill_dueDates[i].innerHTML
        const Paid=bill_paid[i].innerHTML
        const Currency=bill_currency[i].innerHTML
        ws_data.push({Title,Amount,DueDate,Paid,Currency})
    }
    
    const wb=XLSX.utils.book_new() // creating a new workbook

    const ws_name="Bills Sheet" // naming a sheet

    
    
    const ws = XLSX.utils.json_to_sheet(ws_data,
         {header:["Title","Amount","DueDate","Paid","Currency"]});
      
      /* Add the worksheet to the workbook */
      XLSX.utils.book_append_sheet(wb, ws, ws_name);


    XLSX.writeFile(wb,'tracked bills.xlsx', {
        bookType: 'xlsx',
        bookSST: true,
        type: 'binary'
    });
}

// Adding event listener to download file button
downloadBtn.addEventListener('click',saveTableAsExcel)


const generateRandomColors=(total)=>{
    const colors=[]
    // The available hex options
	let hex = ['a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	let color = '#';

    for(i=0;i<total;i++){
	// Create a six-digit hex color
	for (let j = 0; j < 6; j++) {

		// Shuffle the hex values
        let randomIndex=Math.floor(Math.random()*16)
        

		// Append first hex value to the string
		color += hex[randomIndex];

    }
    colors.push(color)
    color='#'
}

	// Return the color string
	return colors;
}


// Drawing Chart of monthly bills
const drawChart=()=>{
    var ctx = document.getElementById("billChart").getContext('2d');
    
    const bill_titles=[...billCards.querySelectorAll('.bill-title')]
    const bill_amount=[...billCards.querySelectorAll('.bill-amount')]
    
    colors=generateRandomColors(bill_titles.length)
    

    var myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: bill_titles.map(bill=> bill.innerHTML),
            datasets: [{    
                data: bill_amount.map(bill=> bill.innerHTML), // Specify the data values array
            
                borderColor: colors, // Add custom color border 
                backgroundColor: colors, // Add custom color background (Points and Fill)
                borderWidth: 1 // Specify bar border width
            }]},         
        options: {
        responsive: true, // Instruct chart js to respond nicely.
        maintainAspectRatio: true, // Add to prevent default behaviour of full-width/height 
        }
    });
}

                //-------------- Managing Data In Firestore --------------------//

// Delete Bill from Firestore
const deleteBill=(element)=>{
    const dataID=element.getAttribute('data-target')
    userDoc.collection('bills').doc(dataID).delete()
    
}

// Adding Bills in Collections of user
const addBillInCollection=(form)=>{

    const billTitle=form['title-bill'].value
    const billCurrency=form['currency-bill'].value
    const billAmount= form['amount-bill'].value
    const billDueDate=form['dueDate-bill'].value
    const billPaidCheck=form['paidCheck-bill'].checked === true ? "Paid": "UnPaid"
    
    const bill={billTitle,billCurrency,billAmount,billDueDate,billPaidCheck}
    //adding in firestore user bill collection
    userDoc.collection('bills').add(bill) 

    form.reset()
    $('#addModal').modal('close')
}
// function used to get data of Bill from Add FORM
addBill_form.addEventListener('submit',(e)=>{
    e.preventDefault()
    addBillInCollection(e.target)
})

// Updating Bill in Collection of user
const updateBillInCollection=(form)=>{
    
    const billTitle=form['title-bill-edit'].value
    const billCurrency=form['currency-bill-edit'].value
    const billAmount= form['amount-bill-edit'].value
    const billDueDate=form['dueDate-bill-edit'].value
    const billPaidCheck=form['paidCheck-bill-edit'].checked === true ? "Paid": "UnPaid"
    
    const bill={billTitle,billCurrency,billAmount,billDueDate,billPaidCheck}
    //updating in firestore user bill collection
    userDoc.collection('bills').doc(billUpdateKey).update(bill) 
    
    form.reset()
    billUpdateKey=null
    $('#updateModal').modal('close')
}

// function used to get data of Bill from Update FORM
updateBill_form.addEventListener('submit',(e)=>{
    e.preventDefault()
    updateBillInCollection(e.target)
})


        // -------------Manipulation of DOM on each event in database ------------ //

// Display Bill Details to update
const displayForUpdate=(element)=>{
    const dataID=element.getAttribute('data-target')
    billUpdateKey=dataID

    const bill_card=document.querySelector(`[data-id=bill${dataID}]`)
    
    const oldTitle=bill_card.querySelector('.bill-title').innerHTML
    const oldCurrency=bill_card.querySelector('.bill-currency').innerHTML
    const oldAmount=bill_card.querySelector('.bill-amount').innerHTML
    const oldDueDate=bill_card.querySelector('.bill-dueDate').innerHTML
    const oldPaidCheck=bill_card.querySelector('.bill-paid').innerHTML

    updateBill_form['title-bill-edit'].value=oldTitle
    updateBill_form['currency-bill-edit'].value=oldCurrency
    updateBill_form['amount-bill-edit'].value=oldAmount
    updateBill_form['dueDate-bill-edit'].value=oldDueDate
    oldPaidCheck === 'Paid' ? 
    updateBill_form['paidCheck-bill-edit'].checked = true:updateBill_form['paidCheck-bill-edit'].checked = false 
    
    $('#updateModal').modal('open')
}

// Update Bill On Page
const updateBillCard=(bill)=>{
    const bill_card=document.querySelector(`[data-id=bill${bill.id}]`)   
    
    bill_card.querySelector('.bill-title').innerHTML=bill.data().billTitle
    bill_card.querySelector('.bill-amount').innerHTML=bill.data().billAmount
    bill_card.querySelector('.bill-dueDate').innerHTML=bill.data().billDueDate
    bill_card.querySelector('.bill-paid').innerHTML=bill.data().billPaidCheck
    bill_card.querySelector('.bill-currency').innerHTML=bill.data().billCurrency
}


// Remove Delete Bills from Page
const removeBillCard=(bill)=>{
    const bill_card=document.querySelector(`[data-id=bill${bill.id}]`)   
    billCards.removeChild(bill_card)
}

// Display Added Bills on Page
const displayBillCard=(bill)=>{
    const card=document.createElement('div')
    card.classList.add('col','s6','m4')
    
    card.setAttribute('data-id','bill'+bill.id)
    card.innerHTML=`
    
                  <div class="card blue-grey darken-1">
                    <div class="card-content white-text">
                      <span class="card-title bill-title">${bill.data().billTitle}</span>
                      <p>
                      Amount: 
                      <i class="fas fa-${bill.data().billCurrency}-sign"></i>
                      <span class="bill-amount">${bill.data().billAmount}</span>
                      </p>
                      <p>
                      Due Date: 
                      <span class="bill-dueDate">${bill.data().billDueDate}</span>
                      </p>
                      <p class="bill-paid">${bill.data().billPaidCheck}</p>
                      <p class="bill-currency hide">${bill.data().billCurrency}</p>
                    </div>
                    <div class="card-action">
                      <a class="btn btn-small green" onClick="displayForUpdate(this)" data-target="${bill.id}" href="JavaScript:void(0)">Edit</a>
                      <a class="btn btn-small red" onClick="deleteBill(this)" data-target="${bill.id}" href="JavaScript:void(0)">Remove</a>
                    </div>
                  </div>
                
    `
    
    billCards.appendChild(card)
    // billCards.appendChild(card)
}

const displayNoBills=()=>{
    const noBillsHeading=document.createElement('h4')
    noBillsHeading.classList.add('white-text','center')
    noBillsHeading.innerHTML='No Bills'
    // const billCards_container=billCards.parentElement
    downloadBtn.classList.add('hide')
    billCards.appendChild(noBillsHeading)
}


const realTimeBills=async(userDoc)=>{
    
    userDoc.collection('bills').onSnapshot(snapshot => {
        if(snapshot.empty){
            console.log('No Bills Added yet')
            displayNoBills() 
        }
        else{
            billCards.innerHTML=''
            downloadBtn.classList.remove('hide')
        }
        snapshot.docChanges().forEach(change => {
            
            if (change.type == 'added') {
                displayBillCard(change.doc)
            } else if (change.type == 'removed') {
                removeBillCard(change.doc)
            } else if (change.type == 'modified') {
                updateBillCard(change.doc)
            }
        })
        
        drawChart()
        
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

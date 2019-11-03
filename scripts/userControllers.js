const db=firebase.firestore()
const billCards=document.getElementById('bill-cards')
const downloadBtn=document.getElementById('downloadBtn')
const addBill_form=document.querySelector('#addModal form')
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



const displayNoBills=()=>{
    const noBillsHeading=document.createElement('h4')
    noBillsHeading.classList.add('white-text','center')
    noBillsHeading.innerHTML='No Bills'
    const billCards_container=billCards.parentElement
    billCards_container.innerHTML=''
    billCards_container.appendChild(noBillsHeading)
}

                //-------------- Managing Data In Firestore --------------------//

// Delete Bill from Firestore
const deleteBill=(element)=>{
    const dataID=element.getAttribute('data-target')
    userDoc.collection('bills').doc(dataID).delete()
    
}

// Adding Bills in Collections of user
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
    const billPaidCheck=form['paidCheck-bill'].checked === true ? "Paid": "UnPaid"
    addBillInCollection({billTitle,billCurrency,billAmount,billDueDate,billPaidCheck})
    form.reset()
    $('#addModal').modal('close')
})

        // -------------Manipulation of DOM on each event in database ------------ //

// Remove Delete Bills from Page
const removeBillCard=(bill)=>{
    const bill_card=document.querySelector(`[data-id=${bill.id}]`)    
    billCards.removeChild(bill_card)
}

// Display Added Bills on Page
const displayBillCard=(bill)=>{
    const card=document.createElement('div')
    card.classList.add('col','s6','m4')
    
    card.setAttribute('data-id',bill.id)
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
                      <a class="btn btn-small green" onClick="display(this)" data-target="${bill.id}" href="JavaScript:void(0)">Edit</a>
                      <a class="btn btn-small red" onClick="deleteBill(this)" data-target="${bill.id}" href="JavaScript:void(0)">Remove</a>
                    </div>
                  </div>
                
    `
    
    billCards.appendChild(card)
    // billCards.appendChild(card)
}



const display=(event)=>{
    
    const dataID=event.getAttribute('data-target')
    console.log(dataID)
}




const realTimeBills=async(userDoc)=>{
    
    userDoc.collection('bills').onSnapshot(snapshot => {
        
        snapshot.docChanges().forEach(change => {
    
            

            if (change.type == 'added') {
                displayBillCard(change.doc)
            } else if (change.type == 'removed') {
                removeBillCard(change.doc)
            } else if (change.type == 'modified') {
                console.log('updated')
            }
            drawChart()
        })
        if(snapshot.empty){
            console.log('No Bills Added yet')
            displayNoBills()
            return 
        }
        
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

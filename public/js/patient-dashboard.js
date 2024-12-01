const urlAA = "http://localhost:8000/api/appointments/add"
const urlGC = "http://localhost:8000/api/patients/checktaken"
const urlD = "http://localhost:8000/dashboard"
const urlLO = "http://localhost:8000/logout"
const urlLI = "http://localhost:8000/login"

var data = {}

window.onload = async function() {

    document.getElementById("welcome").innerHTML = "Witaj " + sessionStorage.getItem("name")
    document.getElementById("check-date").value = new Date(Date.now()).getDate()

    getListOfAppointments()

}

async function getListOfAppointments() {
    
    var content = await asyncGetAppointments()
    data = content.success

    console.log(content)

}

async function buttonAddAppointment() {

    const name = document.getElementById("inputName").value
    const lname = document.getElementById("inputLName").value
    const contact = document.getElementById("inputContact").value
    const address = document.getElementById("inputAddress").value
    const date = document.getElementById("inputDate").value
    const time = document.getElementById("inputTime").value
    const privilege = sessionStorage.getItem("privilege")

    const content = await asyncAddPatient(name, lname, contact, address, privilege)
    console.log(content)

    const id = content.success[0].patientID
    console.log(id)

    if(content.message != "success") {
        getListOfAppointments()
    }
    
    const content2 = await asyncAddAppointment(id, date, time, privilege)
    console.log(content2)

    if(content2.success) {
        getListOfAppointments()
    }
}

async function closePopup() {
    const popupOverlay = document.getElementById('popup-overlay');
    const mainContent = document.getElementById('main-content');
    popupOverlay.style.display = 'none';
    mainContent.classList.remove('blur');
}

async function showPopup() {
    const popupOverlay = document.getElementById('popup-overlay');
    const mainContent = document.getElementById('main-content');
    popupOverlay.style.display = 'flex';
    mainContent.classList.add('blur');
}

async function asyncGetAppointments() { // todo

    date = document.getElementById("check-date").value

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        date: date
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlGC, options)
    const content = await response.json()
    return content
}

async function asyncRemoveAppointment(id, privilege) { // todo

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        id: id,
        privilege: privilege
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlRA, options)
    const content = await response.json()
    return content
}

async function asyncAddAppointment(accountID, date, time, privilege) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        patientID: sessionStorage.getItem("id"),
        accountID: accountID,
        date: date,
        time: time,
        privilege: privilege
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlAA, options)
    const content = await response.json()
    return content
}

async function logout() {

    const response = await fetch(urlLO, {method: "GET"})
    const content = await response.json()
    if (content.message == "success") {
        sessionStorage.clear
        window.location.href = urlLI
    }
    return content
}
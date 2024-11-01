const urlAA = "http://localhost:8000/api/appointments/add"
const urlGC = "http://localhost:8000/api/appointments/count"
const urlPA = "http://localhost:8000/api/patients/add"
const urlD = "http://localhost:8000/dashboard"

window.onload = async function() {
    console.log(sessionStorage)
    document.getElementById("welcome").innerHTML = "Witaj " + sessionStorage.getItem("name")

    var count = await asyncCount(sessionStorage.privilege)
    count = Number(count.success[0].count)
    var maxPerPage = document.getElementById("display-count").value
    console.log(maxPerPage)
    var maxPages = 1 + Math.floor(count / maxPerPage) 
    document.getElementById("count").innerHTML = "Strona 1/" + maxPages + " (" + count + " pól)"

    // Wczytanie tablicy
}

async function buttonAddAppointment() {

    const name = document.getElementById("inputName").value
    const lname = document.getElementById("inputLName").value
    const contact = document.getElementById("inputContact").value
    const date = document.getElementById("inputDate").value
    const time = document.getElementById("inputTime").value
    const privilege = sessionStorage.getItem("privilege")

    const content = await asyncAddPatient(name, lname, contact, privilege)
    console.log(content)

    // if(content.message = "success") {
    //     window.location.href = urlD
    // }
    // else {
    //     window.location.href = urlD
    // }
}

async function asyncCount(privilege) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        privilege: privilege,
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

async function asyncAddAppointment(name, patientID, date, time, privilege) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        patientID: patientID,
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

async function asyncAddPatient(name, lname, contact, privilege) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        name: name,
        lname: lname,
        contact: contact,
        privilege: privilege
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlPA, options)
    const content = await response.json()
    return content
}
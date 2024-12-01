const urlAA = "http://localhost:8000/api/appointments/add"
const urlGC = "http://localhost:8000/api/appointments/count"
const urlGA = "http://localhost:8000/api/appointments/select"
const urlUA = "http://localhost:8000/api/appointments/update"
const urlRA = "http://localhost:8000/api/appointments/remove"
const urlPA = "http://localhost:8000/api/patients/add"
const urlD = "http://localhost:8000/personel/dashboard"
const urlLO = "http://localhost:8000/logout"
const urlLI = "http://localhost:8000/personel/login"

var currentPage = 1
var maxPages = 1
var data = {}

window.onload = async function() {

    document.getElementById("welcome").innerHTML = "Witaj " + sessionStorage.getItem("name")

    getListOfAppointments()

}

async function nextPage() {
    if(currentPage < maxPages) {
        currentPage += 1
        getListOfAppointments()
    }
}

async function prevPage() {
    if(currentPage > 2) {
        currentPage -= 1
        getListOfAppointments()
    }
}

async function getListOfAppointments() {
    
    var count = await asyncCount(sessionStorage.privilege)
    count = Number(count.success[0].count)
    var maxPerPage = document.getElementById("display-count").value
    console.log(maxPerPage)
    maxPages = 1 + Math.floor(count / maxPerPage) 
    document.getElementById("count").innerHTML = "Strona " + currentPage + "/" + maxPages + " (ilość pól: " + count + ")"

    var content = await asyncGetAppointments(maxPerPage, (currentPage - 1), sessionStorage.getItem("privilege"))
    data = content.success

    displayAppointments(data)
    closePopup();

}

async function displayAppointments(content) {
    if(document.getElementById("table-data") != null) {
        document.getElementById("table-data").remove()
    }
    var test = document.createElement("tbody")
    test.id = "table-data"
    for(i in content) {
        var tr = document.createElement("tr")
        var tdSelector = document.createElement("td")
        var selector = document.createElement("input")
        selector.type = "radio"
        selector.name = "select-appointment"
        selector.value = content[i].appointmentID
        tdSelector.appendChild(selector)
        tr.appendChild(tdSelector)

        for(j = 0; j < 7; j++) {
            var element = document.createElement("td")
            console.log(content[i])
            switch(j) {
                case 0:
                    var text = document.createTextNode(content[i].patientName)
                    break
                case 1:
                    var text = document.createTextNode(content[i].patientLName)
                    break
                case 2:
                    var text = document.createTextNode(content[i].appointmentDate)
                    break
                case 3:
                    var text = document.createTextNode(content[i].appointmentTime)
                    break
                case 4:
                    var text = document.createTextNode(content[i].patientContact)
                    break
                case 5:
                    var text = document.createTextNode(content[i].patientAddress)
                    break
                case 6:
                    var text = document.createTextNode(content[i].appointmentStatus)
                    break
            }
            
            element.appendChild(text)
            tr.appendChild(element)
        }

        
        test.appendChild(tr)
    }
    document.getElementById("table").append(test)
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

async function showEdit() {

    showPopup();

    document.getElementById("func-save-button").style.display = "none";
    document.getElementById("func-edit-button").style.display = "block";

    console.log("omegalul");
    console.log(document.querySelector('input[name="select-appointment"]:checked').value);

    var list = document.getElementsByClassName("display-edit");
    for(i = 0; i < list.length; i++) {
        list[i].style.display = "block";
    }

    var selectedData = data.find((element => element.appointmentID == document.querySelector('input[name="select-appointment"]:checked').value))
    
    document.getElementById("inputName").value = selectedData.patientName;
    document.getElementById("inputLName").value = selectedData.patientLName;
    document.getElementById("inputContact").value = selectedData.patientContact;
    document.getElementById("inputAddress").value = selectedData.patientAddress;
    document.getElementById("inputDate").value = selectedData.appointmentDate;
    document.getElementById("inputTime").value = selectedData.appointmentTime;
    document.getElementById("inputStatus").value = selectedData.appointmentStatus;

}

async function showAdd() {

    showPopup();

    document.getElementById("func-save-button").style.display = "block";
    document.getElementById("func-edit-button").style.display = "none";
    
    var list = document.getElementsByClassName("display-edit");
    console.log(list)
    for(i = 0; i < list.length; i++) {
        list[i].style.display = "none";
    }

    document.getElementById("inputName").value = '';
    document.getElementById("inputLName").value = '';
    document.getElementById("inputContact").value = '';
    document.getElementById("inputAddress").value = '';
    document.getElementById("inputDate").value = '';
    document.getElementById("inputTime").value = '';

}

async function buttonEditAppointment() {

    const appointmentId = document.querySelector('input[name="select-appointment"]:checked').value
    const name = document.getElementById("inputName").value
    const lname = document.getElementById("inputLName").value
    const contact = document.getElementById("inputContact").value
    const address = document.getElementById("inputAddress").value
    const date = document.getElementById("inputDate").value
    const time = document.getElementById("inputTime").value
    const status = document.getElementById("inputStatus").value
    const privilege = sessionStorage.getItem("privilege")

    const content = await asyncAddPatient(name, lname, contact, address, privilege)
    console.log(content)

    const id = content.success[0].patientID
    console.log(id)

    if(content.message != "success") {
        getListOfAppointments()
    }
    
    const content2 = await asyncEditAppointment(appointmentId, id, date, time, status, address, privilege)

    if(content2.message == "success") {
        getListOfAppointments()
    }
}

async function buttonRemoveAppointment() {

    const id = document.querySelector('input[name="select-appointment"]:checked').value;
    const privilege = sessionStorage.getItem("privilege")
    
    const content = await asyncRemoveAppointment(id, privilege)

    if(content.message == "success") {
        getListOfAppointments()
    }
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

async function asyncGetAppointments(limit, offset, privilege) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        privilege: privilege,
        limit: limit,
        offset: offset,
        id: sessionStorage.getItem("id")
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlGA, options)
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

async function asyncAddAppointment(patientID, date, time, privilege) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        patientID: patientID,
        accountID: sessionStorage.getItem("id"),
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



async function asyncEditAppointment(appointmentID, patientID, date, time, address, status, privilege) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        appointmentID: appointmentID,
        patientID: patientID,
        date: date,
        time: time,
        status: status,
        address: address,
        privilege: privilege
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlUA, options)
    const content = await response.json()
    return content
}

async function asyncAddPatient(name, lname, contact, address, privilege) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        name: name,
        lname: lname,
        contact: contact,
        address: address,
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
async function logout() {

    const response = await fetch(urlLO, {method: "GET"})
    const content = await response.json()
    if (content.message == "success") {
        sessionStorage.clear
        window.location.href = urlLI
    }
    return content
}
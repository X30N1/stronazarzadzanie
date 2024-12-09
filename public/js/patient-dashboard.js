const urlAA = "http://localhost:8000/api/appointments/add"
const urlGC = "http://localhost:8000/api/patients/checktaken"
const urlGP = "http://localhost:8000/api/patients/getpersonnel"
const urlSA = "http://localhost:8000/api/patients/selectappointments"
const urlPC = "http://localhost:8000/api/patients/count"
const urlPU = "http://localhost:8000/api/patients/update"
const urlPCP = "http://localhost:8000/api/patients/changepassword"
const urlPCh = "http://localhost:8000/api/cert/password"
const urlRA = "http://localhost:8000/api/appointments/remove"
const urlD = "http://localhost:8000/dashboard"
const urlLO = "http://localhost:8000/logout"
const urlLI = "http://localhost:8000/login"

var currentPage = 1
var maxPages = 1

Date.prototype.getWeek = function (dowOffset) {
    /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

    dowOffset = typeof(dowOffset) == 'number' ? dowOffset : 0; //default dowOffset to zero
    var newYear = new Date(this.getFullYear(),0,1);
    var day = newYear.getDay() - dowOffset; //the day of week the year begins on
    day = (day >= 0 ? day : day + 7);
    var daynum = Math.floor((this.getTime() - newYear.getTime() - 
    (this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
    var weeknum;
    //if the year starts before the middle of a week
    if(day < 4) {
        weeknum = Math.floor((daynum+day-1)/7) + 1;
        if(weeknum > 52) {
            nYear = new Date(this.getFullYear() + 1,0,1);
            nday = nYear.getDay() - dowOffset;
            nday = nday >= 0 ? nday : nday + 7;
            /*if the next year starts before the middle of
                the week, it is week #1 of that year*/
            weeknum = nday < 4 ? 1 : 53;
        }
    }
    else {
        weeknum = Math.floor((daynum+day-1)/7);
    }
    return weeknum;
};

var data = {}

window.onload = async function() {

    document.getElementById("welcome").innerHTML = "Witaj " + sessionStorage.getItem("name")
    getListOfAppointments()

    var content = await asyncGetPersonnel()
    data = content.success

    displayPersonnel(data)
    //console.log("bruh")

}

async function getListOfAppointments() {

    var content = await asyncGetAppointments(document.getElementById('display-personnel').value)
    if(content) {
        data = content.success
    }
    

    for(i in data) {
        //console.log(data[i].appointmentTime)
    }

    //console.log(content.success)
    date = new Date(document.getElementById('check-date').value)
    datenow = new Date(Date.now())
    console.log(date.getTime())
    console.log(datenow.getTime())
    type = 0
    if (date.getTime() <= datenow.getTime()) {
        type = 2
    }
    else if(date.getWeek() % 2 == 0 && date.getDay() == 6) {
        type = 0
    }
    else if (date.getDay() >= 1 && date.getDay() <= 5) {
        type = 1
    }
    else {
        type = 2
    }

    console.log(type)

    displayAppointments(data, type)
    
    var count = await asyncPatientCount()
    count = Number(count.success[0].count)
    var maxPerPage = document.getElementById("display-count").value
    //console.log(maxPerPage)
    maxPages = 1 + Math.floor(count / maxPerPage) 
    document.getElementById("count").innerHTML = "Strona " + currentPage + "/" + maxPages + " (ilość pól: " + count + ")"

    var content = await asyncGetPatientAppointments(maxPerPage, (currentPage - 1))
    data = content.success

    displayPatientAppointments(data)
    
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

async function closePopupAccount() {
    const popupOverlay = document.getElementById('popup-overlay-account');
    const mainContent = document.getElementById('main-content');
    popupOverlay.style.display = 'none';
    mainContent.classList.remove('blur');
}

async function showPopupAccount() {
    const popupOverlay = document.getElementById('popup-overlay-account');
    const mainContent = document.getElementById('main-content');
    popupOverlay.style.display = 'flex';
    mainContent.classList.add('blur');
    document.getElementById("inputAName").value = sessionStorage.getItem("name")
    document.getElementById("inputALName").value = sessionStorage.getItem("lname")
    document.getElementById("inputAEMail").value = sessionStorage.getItem("email")
    document.getElementById("inputAContact").value = sessionStorage.getItem("contact")
    document.getElementById("inputAAddress").value = sessionStorage.getItem("address")
}

async function buttonEditAccount(){
    const name = document.getElementById("inputAName").value
    const lname = document.getElementById("inputALName").value
    const email = document.getElementById("inputAEMail").value
    const contact = document.getElementById("inputAContact").value
    const address = document.getElementById("inputAAddress").value
    const oldpsw = document.getElementById("inputAOldPassword").value
    const newpsw = document.getElementById("inputANewPassword").value
    const cnewpsw = document.getElementById("inputAConfirmNewPassword").value

    if(name == "" || lname == "" || email == "" || contact == "" || address == "") { 

    }
    if(oldpsw != "" && newpsw != "" && cnewpsw != "") {
        if(newpsw != cnewpsw) {
            document.getElementById("error-info").innerHTML = "<b>Błąd:</b> Hasła nie są identyczne."
            return
        }
        else if(newpsw.length < 12) {
            document.getElementById("error-info").innerHTML = "<b>Błąd:</b> Hasło jest za krótkie"
            return
        }
        else if(/\d/.test(newpsw) == false) {
            document.getElementById("error-info").innerHTML = "<b>Błąd:</b> Hasło musi zawierać co najmniej jedna cyfrę."
            return
        }
    
        var checkPassword = await asyncCheckCert(newpsw)
        //console.log(checkPassword)
    
        if(checkPassword.message == 'failure') {
            document.getElementById("error-info").innerHTML = "<b>Błąd:</b> Hasło znajduje sie w bazie danych popularnych haseł!"
            return
        }
        
        var content = await asyncChangePassword(oldpsw, newpsw)

        if(content.message == "failure") {
            document.getElementById("error-info").innerHTML = "<b>Błąd:</b> Stare hasło nie było identyczne!"
            return
        }
    }

    var content = await asyncUpdateAccount(name, lname, email, contact, address)

    if(content.message == "success") {
        sessionStorage.setItem("name", name)
        sessionStorage.setItem("lname", lname)
        sessionStorage.setItem("email", email)
        sessionStorage.setItem("contact", contact)
        sessionStorage.setItem("address", address)
        document.getElementById("welcome").innerHTML = "Witaj " + sessionStorage.getItem("name")
    }
    else {
        document.getElementById("error-info").innerHTML = "<b>Błąd:</b> Wystąpił jakiś błąd!"
        return
    }
    closePopupAccount()
}

async function buttonAddAppointment() {
    id = document.getElementById("display-personnel").value
    date = document.getElementById("check-date").value
    time = document.getElementById("display-time").value

    var content = await asyncAddAppointment(id, date, time)
    if(content.success) {
        showPopup()
        getListOfAppointments()
    }
}

async function displayPatientAppointments(content) {
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

        for(j = 0; j < 4; j++) {
            var element = document.createElement("td")
            //console.log(content[i])
            switch(j) {
                case 0:
                    var text = document.createTextNode(content[i].name)
                    break
                case 1:
                    var text = document.createTextNode(content[i].lname)
                    break
                case 2:
                    var text = document.createTextNode(content[i].appointmentDate)
                    break
                case 3:
                    var text = document.createTextNode(content[i].appointmentTime)
                    break
            }
            
            element.appendChild(text)
            tr.appendChild(element)
        }
        
        test.appendChild(tr)
    }
    document.getElementById("table").append(test)
}

async function displayAppointments(content, type) {
    if(document.getElementById("display-time") != null) {
        document.getElementById("display-time").remove()
    }
    possibleDates = []
    if(type == 0) {
        possibleDates = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
    }
    else if(type == 1) {
        possibleDates = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"]
    }
    else {
        return
    }

    for(i in content) {
        a = possibleDates.indexOf(content[i].appointmentTime)
        if (a > -1) {
            possibleDates.splice(a, 1)
        }
        //console.log(content[i].appointmentTime)
        //console.log(a)
    }

    if(possibleDates == []) {
        return
    }

    var test = document.createElement("select")
    test.id = "display-time"
    
    for(i in possibleDates) {
        var option = document.createElement("option")
        option.value = possibleDates[i]
        option.innerHTML = possibleDates[i]
        test.appendChild(option)
    }

    document.getElementById("select-date").append(test)
}

async function displayPersonnel(content) {

    var test = document.getElementById('display-personnel')

    if(document.getElementsByClassName("dp") != null) {
        document.querySelectorAll(".dp").forEach(el => el.remove());
    }
    
    for(i in content) {
        var option = document.createElement("option")
        option.value = content[i].accountID
        option.innerHTML = content[i].name + " " + content[i].lname
        option.className = "dp"
        test.appendChild(option)
    }
}

async function buttonRemoveAppointment() {

    const id = document.querySelector('input[name="select-appointment"]:checked').value;
    
    const content = await asyncRemoveAppointment(id)

    if(content.message == "success") {
        getListOfAppointments()
    }
}

async function asyncRemoveAppointment(id) { // todo

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        id: id
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

async function asyncGetAppointments(id) { // todo

    date = document.getElementById("check-date").value
    nd = new Date(date)
    dn = new Date(Date.now())

    if(nd.getDay() < dn.getDay() || nd.getMonth() < dn.getMonth() || nd.getFullYear() < dn.getFullYear()) {
        if(document.getElementById("display-time") != null) {
            document.getElementById("display-time").remove()
        }
        return 
    }

    //console.log(date)

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        date: date,
        id: id
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

async function asyncGetPatientAppointments(limit, offset) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        limit: limit,
        offset: offset,
        id: sessionStorage.getItem("id")
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlSA, options)
    const content = await response.json()
    return content
}

async function asyncPatientCount() {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        id: sessionStorage.getItem("id")
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlPC, options)
    const content = await response.json()
    return content
}

async function asyncGetPersonnel() {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlGP, options)
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

async function asyncAddAppointment(accountID, date, time) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        patientID: sessionStorage.getItem("id"),
        accountID: accountID,
        date: date,
        time: time
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

async function asyncCheckCert(password) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        password: password
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlPCh, options)
    const content = await response.json()
    return content

}

async function asyncChangePassword(oldpsw, newpsw) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        id: sessionStorage.getItem("id"),
        password: oldpsw,
        newPassword: newpsw
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlPCP, options)
    const content = await response.json()
    return content
}

async function asyncUpdateAccount(name, lname, email, contact, address) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        patientID: sessionStorage.getItem("id"),
        patientName: name,
        patientLName: lname,
        patientEmail: email,
        patientContact: contact,
        patientAddress: address
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlPU, options)
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
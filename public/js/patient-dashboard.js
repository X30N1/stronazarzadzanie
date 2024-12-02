const urlAA = "http://localhost:8000/api/appointments/add"
const urlGC = "http://localhost:8000/api/patients/checktaken"
const urlGP = "http://localhost:8000/api/patients/getpersonel"
const urlD = "http://localhost:8000/dashboard"
const urlLO = "http://localhost:8000/logout"
const urlLI = "http://localhost:8000/login"

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
    getListOfAppointments(1)

}

async function getListOfAppointments(t) {
    
    if(t == 1) {
        var content = await asyncGetPersonel()
        data = content.success

        displayPersonel(data)
        console.log("bruh")
    }

    var content = await asyncGetAppointments(document.getElementById('display-personel').value)
    data = content.success

    for(i in data) {
        console.log(data[i].appointmentTime)
    }

    console.log(content.success)
    date = new Date(document.getElementById('check-date').value)
    type = 0
    if(date.getWeek() % 2 == 0 && date.getDay() == 6) {
        type = 0
    }
    else if (date.getDay() >= 1 && date.getDay() <= 5) {
        type = 1
    }
    else {
        type = 2
    }

    displayAppointments(data, type)
    
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
        console.log(content[i].appointmentTime)
        console.log(a)
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

async function displayPersonel(content) {
    if(document.getElementById("display-personel") != null) {
        document.getElementById("display-personel").remove()
    }

    var test = document.createElement("select")
    test.id = "display-personel"
    
    for(i in content) {
        var option = document.createElement("option")
        option.value = content[i].accountID
        option.innerHTML = content[i].name + " " + content[i].lname
        test.appendChild(option)
    }

    document.getElementById("select-date").append(test)
}

async function asyncGetAppointments(id) { // todo

    date = document.getElementById("check-date").value
    console.log(date)

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

async function asyncGetPersonel() {

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
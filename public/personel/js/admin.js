const urlPeR = "http://localhost:8000/personel/register"
const urlPaR = "http://localhost:8000/register"
const urlAC = "http://localhost:8000/api/accounts/admin/count"
const urlPC = "http://localhost:8000/api/patients/admin/count"
const urlAS = "http://localhost:8000/api/accounts/admin/select"
const urlPS = "http://localhost:8000/api/patients/admin/select"
const urlAR = "http://localhost:8000/api/accounts/admin/remove"
const urlPR = "http://localhost:8000/api/patients/admin/remove"
const urlAU = "http://localhost:8000/api/accounts/admin/update"
const urlPU = "http://localhost:8000/api/patients/admin/update"
const urlLO = "http://localhost:8000/logout"
const urlLI = "http://localhost:8000/personel/login"

var currentTabIndex = 0;
var currentPage = 1
var maxPages = 1
var data = {}

window.onload = async function() {

const tabs = document.querySelectorAll('[role="tab"]');
const tabContentContainer = document.querySelector('.window[role="tabpanel"] .window-body');



// FOR JESS: Tutaj każda linia to kolejna karta po kliknięciu w kartę na liściw w HTML.
//Można sztywną stronę, albo dać skrypt żeby z serwera wywoływał stronę
const tabContents = [
    '<h2>Tabela pacjentów</h2><p>Wybierz pacjenta zaznaczając odpowiednie konto. Następnie kliknij edytuj by zmienić jego informacje, lub usuń by te informacje usunąć.</p>', //zakładka 1 w '(treść tutaj)'
    '<h2>Tabela lekarzy</h2><p>Wybierz lekarza zaznaczając odpowiednie konto. Następnie kliknij edytuj by zmienić jego informacje, lub usuń by te informacje usunąć.</p>',
];

function switchTab(event) {
    tabs.forEach(tab => {
        tab.setAttribute('aria-selected', 'false');
    });
    const selectedTab = event.currentTarget;
    selectedTab.setAttribute('aria-selected', 'true');

    const tabIndex = Array.from(tabs).indexOf(selectedTab);
    currentTabIndex = tabIndex
    tabContentContainer.innerHTML = tabContents[tabIndex];

    document.getElementById("table-thingo").style.display = "block";

    getListOf();
    
}


tabs.forEach(tab => {
    tab.addEventListener('click', switchTab);
});

var modal = document.getElementById("myModal");
    var btn = document.getElementById("helpBtn");
    var span = document.getElementsByClassName("close-btn")[0];
    btn.onclick = function() {
        modal.style.display = "block";
    }
    span.onclick = function() {
        modal.style.display = "none";
}

}

async function showAdd() {
    if(currentTabIndex == 0) {
        window.open(urlPaR)
    }
    else if(currentTabIndex == 1) {
        window.open(urlPeR)
    }
}

async function getListOf() {
    if(currentTabIndex == 0) {
        currentPage = 1
        getListOfPatients()
    }
    if(currentTabIndex == 1) {
        currentPage = 1
        getListOfPersonel()
    }
}

async function buttonRemove() {
    const id = document.querySelector('input[name="select-account"]:checked').value;
 
    if(currentTabIndex == 0) {
        
        const content = await asyncRemovePatient(id)

        if(content.message == "success") {
            getListOfPatients()
        }
    }
    if(currentTabIndex == 1) {
        const content = await asyncRemovePersonel(id)

        if(content.message == "success") {
            getListOfPersonel()
        }
    }
}

async function buttonEdit() {
    const id = document.querySelector('input[name="select-account"]:checked').value;
    const login = document.getElementById("inputALogin").value
    const name = document.getElementById("inputAName").value
    const lname = document.getElementById("inputALName").value
    const email = document.getElementById("inputAEMail").value
    
    var content


    if(currentTabIndex == 0) {
        const contact = document.getElementById("inputAContact").value
        const address = document.getElementById("inputAAddress").value
        content = await asyncUpdatePatient(id, login, name, lname, email, contact, address)
    }
    else if(currentTabIndex == 1) {
        content = await asyncUpdatePersonel(id, login, name, lname, email)
    }

    if(content.message == "success") {
        getListOf()
        closePopup()
    }
}

async function nextPage() {
    if(currentPage < maxPages) {
        currentPage += 1
        getListOf()
    }
}

async function prevPage() {
    if(currentPage > 2) {
        currentPage -= 1
        getListOf()
    }
}

async function getListOfPatients() {
    var count = await asyncCount()
    count = Number(count.success[0].count)
    var maxPerPage = document.getElementById("display-count").value
    maxPages = 1 + Math.floor(count / maxPerPage) 
    document.getElementById("count").innerHTML = "Strona " + currentPage + "/" + maxPages + " (ilość pól: " + count + ")"

    var content = await asyncGetPatients(maxPerPage, (currentPage - 1))
    data = content.success

    displayPatients(data)
    closePopup();
}

async function getListOfPersonel() {
    var count = await asyncCount()
    count = Number(count.success[0].count)
    var maxPerPage = document.getElementById("display-count").value
    maxPages = 1 + Math.floor(count / maxPerPage) 
    document.getElementById("count").innerHTML = "Strona " + currentPage + "/" + maxPages + " (ilość pól: " + count + ")"

    var content = await asyncGetPersonel(maxPerPage, (currentPage - 1))
    data = content.success

    displayPersonel(data)
    closePopup();
}

async function asyncGetPatients(limit, offset) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        privilege: sessionStorage.getItem("privilege"),
        limit: limit,
        offset: offset
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlPS, options)
    const content = await response.json()
    return content
}

async function asyncGetPersonel(limit, offset) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        privilege: sessionStorage.getItem("privilege"),
        limit: limit,
        offset: offset
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlAS, options)
    const content = await response.json()
    return content
}

async function asyncCount() {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        privilege: sessionStorage.getItem("privilege")
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    var url

    if(currentTabIndex == 0) {
        url = urlPC
    }
    else if(currentTabIndex == 1) {
        url = urlAC
    }
    const response = await fetch(url, options)
    const content = await response.json()
    return content
}

async function closePopup() {
    const popupOverlay = document.getElementById('popup-overlay');
    const mainContent = document.getElementById('window');
    popupOverlay.style.display = 'none';
    el = document.getElementsByClassName("patient")
    for(i = 0; i < el.length; i++) {
        el[i].style.display == "none";
    }
    mainContent.classList.remove('blur');
}

async function showPopup() {
    const popupOverlay = document.getElementById('popup-overlay');
    const mainContent = document.getElementById('window');
    popupOverlay.style.display = 'flex';
    mainContent.classList.add('blur');
}

async function showEdit() {

    showPopup();

    el = document.getElementsByClassName("patient")
    for(i = 0; i < el.length; i++) {
        if(currentTabIndex == 0) {
            el[i].style.display = "flex";
        }
        else if(currentTabIndex == 1) {
            el[i].style.display = "none";
        }
    }

    if(currentTabIndex == 0) {
        var selectedData = data.find((element => element.patientID == document.querySelector('input[name="select-account"]:checked').value))
        document.getElementById("inputALogin").value = selectedData.patientLogin;
        document.getElementById("inputAName").value = selectedData.patientName;
        document.getElementById("inputALName").value = selectedData.patientLName;
        document.getElementById("inputAEMail").value = selectedData.patientEmail;
        document.getElementById("inputAContact").value = selectedData.patientContact;
        document.getElementById("inputAAddress").value = selectedData.patientAddress;
    }
    else if(currentTabIndex == 1) {
        var selectedData = data.find((element => element.accountID == document.querySelector('input[name="select-account"]:checked').value))
        document.getElementById("inputALogin").value = selectedData.login;
        document.getElementById("inputAName").value = selectedData.name;
        document.getElementById("inputALName").value = selectedData.lname;
        document.getElementById("inputAEMail").value = selectedData.email;
    }
}


async function displayPatients(content) {
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
        selector.name = "select-account"
        selector.value = content[i].patientID
        tdSelector.appendChild(selector)
        tr.appendChild(tdSelector)

        for(j = 0; j < 5; j++) {
            var element = document.createElement("td")
            ////console.log(content[i])
            switch(j) {
                case 0:
                    var text = document.createTextNode(content[i].patientID)
                    break
                case 1:
                    var text = document.createTextNode(content[i].patientLogin)
                    break
                case 2:
                    var text = document.createTextNode(content[i].patientEmail)
                    break
                case 3:
                    var text = document.createTextNode(content[i].patientName)
                    break
                case 4:
                    var text = document.createTextNode(content[i].patientLName)
                    break
            }
            
            element.appendChild(text)
            tr.appendChild(element)
        }

        
        test.appendChild(tr)
    }
    document.getElementById("table").append(test)
}

async function displayPersonel(content) {
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
        selector.name = "select-account"
        selector.value = content[i].accountID
        tdSelector.appendChild(selector)
        tr.appendChild(tdSelector)

        for(j = 0; j < 5; j++) {
            var element = document.createElement("td")
            ////console.log(content[i])
            switch(j) {
                case 0:
                    var text = document.createTextNode(content[i].accountID)
                    break
                case 1:
                    var text = document.createTextNode(content[i].login)
                    break
                case 2:
                    var text = document.createTextNode(content[i].email)
                    break
                case 3:
                    var text = document.createTextNode(content[i].name)
                    break
                case 4:
                    var text = document.createTextNode(content[i].lname)
                    break
            }
            
            element.appendChild(text)
            tr.appendChild(element)
        }

        
        test.appendChild(tr)
    }
    document.getElementById("table").append(test)
}

async function asyncRemovePatient(id) { // todo

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        privilege: sessionStorage.getItem("privilege"),
        id: id
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlPR, options)
    const content = await response.json()
    return content
}

async function asyncRemovePersonel(id) { // todo

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        privilege: sessionStorage.getItem("privilege"),
        id: id
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlAR, options)
    const content = await response.json()
    return content
}

async function asyncUpdatePersonel(id, login, name, lname, email) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        id: id,
        login: login,
        name: name,
        lname: lname,
        email: email,
        privilege: sessionStorage.getItem("privilege")
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlAU, options)
    const content = await response.json()
    return content
}

async function asyncUpdatePatient(id, login, name, lname, email, contact, address) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        patientID: id,
        patientLogin: login,
        patientName: name,
        patientLName: lname,
        patientEmail: email,
        patientContact: contact,
        patientAddress: address,
        privilege: sessionStorage.getItem("privilege")
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

const url = "http://localhost:8000/api/accounts/register"
const urlL = "http://localhost:8000/login"
const urlR = "http://localhost:8000/register"

window.onload = function() {
    var cookie = getCookie("message")
    if(cookie) {
        displayError(cookie)
        document.cookie = "message =; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite = None; Secure; path=/register;"
    }
}

async function toLogin() {
    window.location.href = urlL
}

async function displayError(error) {
    switch(error) {
        case "passwordCheck":
            document.getElementById("infoMsg").innerHTML = "Błąd: Hasła nie były identyczne"
            break
        case "missingInput":
            document.getElementById("infoMsg").innerHTML = "Błąd: Wszystkie pola muszą być uzupełnione"
            break;
        case "error":
            document.getElementById("infoMsg").innerHTML = "Błąd: Coś poszło nie tak..."
            break;
    }
}

async function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

async function button() {

    const name = document.getElementById("inputName").value
    const lname = document.getElementById("inputLName").value
    const email = document.getElementById("inputEmail").value
    const login = document.getElementById("inputLogin").value
    const password = document.getElementById("inputPassword").value
    const passwordC = document.getElementById("inputPasswordC").value
    const privilege = 1

    if(name == "" || lname == "" || email == "" || login == "" || password == "" || password == "") {
        document.cookie = "message = missingInput; SameSite = None; Max-Age = 1000; Secure; path=/register;"
        document.getElementById("error").innerHTML = "<b>Błąd:</b> Wszystkie pola muszą być uzupełnione."
        return
    }
    else if(password != passwordC) {
        document.cookie = "message = passwordCheck; SameSite = None; Max-Age = 1000; Secure; path=/register;"
        document.getElementById("error").innerHTML = "<b>Błąd:</b> Hasła nie są identyczne."
        return
    }
    else if(password.length < 12) {
        document.cookie = "message = passwordCheck; SameSite = None; Max-Age = 1000; Secure; path=/register;"
        document.getElementById("error").innerHTML = "<b>Błąd:</b> Hasło jest za krótkie"
        return
    }
    else if(/\d/.test(password) == false) {
        document.cookie = "message = passwordCheck; SameSite = None; Max-Age = 1000; Secure; path=/register;"
        document.getElementById("error").innerHTML = "<b>Błąd:</b> Hasło musi zawierać co najmniej jedna cyfrę."
        return
    }
    else if(certcheck(password)) { // DO NAPRAWY
        document.cookie = "message = certCheck; SameSite = None; Max-Age = 1000; Secure; path=/register;"
        document.getElementById("error").innerHTML = "<b>Błąd:</b> Hasło jest zbyt proste, sprobój zrobić trudniejsze hasło."
        return
    }



    console.log(name)
    console.log(lname)
    console.log(email)
    console.log(login)
    console.log(password)
    console.log(privilege)

    var content = await asyncRegister(name, lname, email, login, password, privilege)
    
    if(content.message == "success") {
        document.cookie = "message = success; SameSite = None; Max-Age = 1000; Secure; path=/login;"
        window.location.href = urlL
    }
    else {
        document.cookie = "message = error; SameSite = None; Max-Age = 1000; Secure; path=/register;"
        window.location.href = urlR
    }
}

async function asyncRegister(name, lname, email, login, password, privilege) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        name: name,
        lname: lname,
        email: email,
        login: login,
        password: password,
        privilege: privilege
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(url, options)
    const content = await response.json()
    return content
}

async function certcheck(input) {

try {
    const filecontent = fs.readFileSync(path.join(__dirname, 'wordlist_pl.txt'), 'utf-8');
    const lines = filecontent.split('\n').map(line => line.trim());
    if (lines.includes(input)) {
        return true;
    } 
    else {
        return false;
    }
} 
catch (err) {
    console.error('Error reading wordlist:', err);
}
}
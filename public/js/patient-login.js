const urlAL = "http://localhost:8000/api/patients/login"
const urlD = "http://localhost:8000/dashboard"
const urlL = "http://localhost:8000/login"
const urlR = "http://localhost:8000/register"

async function button() {
    const login = document.getElementById("inputLogin").value
    const password = document.getElementById("inputPassword").value

    console.log(login)
    console.log(password)

    const content = await asyncLogin(login, password)
    console.log(content)

    if(content.message == "success") {
        sessionStorage.setItem("id", content.id)
        sessionStorage.setItem("login", login)
        sessionStorage.setItem("name", content.name)
        sessionStorage.setItem("lname", content.lname)
        sessionStorage.setItem("privilege", content.privilege)
        window.location.href = urlD
    }
    else {
        document.getElementById("error").innerHTML = "<b>BŁĄD:</b> Zły login bądź hasło. Sprobój ponownie." //DO NAPRAWY
    }
}

async function toRegister() {
    window.location.href = urlR
}

async function asyncLogin(login, password) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        login: login,
        password: password  
    })

    const options = {
        method: "POST",
        headers: headers,
        body: body
    }

    const response = await fetch(urlAL, options)
    const content = await response.json()

    return content
}
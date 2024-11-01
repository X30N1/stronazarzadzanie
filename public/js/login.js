const url = "http://localhost:8000/api/accounts/login"

async function button() {
    const login = document.getElementById("inputLogin").value
    const password = document.getElementById("inputPassword").value

    console.log(login)
    console.log(password)

    const content = await asyncLogin(login, password)
    console.log(content)
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

    const response = await fetch(url, options)
    const content = await response.json()
    return content
}
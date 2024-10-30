const url = "http://localhost:8000/api/accounts/login"

function test() {
    const login = document.getElementById("inputLogin").value
    const password = document.getElementById("inputPassword").value

    console.log(login)
    console.log(password)

    asyncLogin(login, password)
}

async function asyncLogin(login, password) {

    const headers = new Headers({
        "Content-Type": "application/json"
    })

    const body = JSON.stringify({
        request: {
            login: login,
            password: password
        }      
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
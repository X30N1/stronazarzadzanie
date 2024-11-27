const urlL = "http://localhost:8000/api/patients/login"


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
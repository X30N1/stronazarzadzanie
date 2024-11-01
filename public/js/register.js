const url = "http://localhost:8000/api/accounts/register"
const url2 = "http://localhost:8000/login"

async function button() {

    const name = document.getElementById("inputName").value
    const lname = document.getElementById("inputLName").value
    const email = document.getElementById("inputEmail").value
    const login = document.getElementById("inputLogin").value
    const password = document.getElementById("inputPassword").value
    const privilege = 1

    console.log(name)
    console.log(lname)
    console.log(email)
    console.log(login)
    console.log(password)
    console.log(privilege)

    var content = await asyncRegister(name, lname, email, login, password, privilege)

    console.log(content.message)
    // if(content.value[0].message = "success")
    // window.location.href = url2
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
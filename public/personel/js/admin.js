const urlD = "http://localhost:8000/personel/dashboard"
const urlI = "http://localhost:8000"
const urlLO = "http://localhost:8000/logout"

async function logout() {

    const response = await fetch(urlLO, {method: "GET"})
    const content = await response.json()
    if (content.message == "success") {
        sessionStorage.clear
        window.location.href = urlI
    }
    return content
}

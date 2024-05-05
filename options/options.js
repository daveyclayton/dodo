import { getSync, saveSync } from "../shared/storage.js"

function saveCredentials () {
    const apiAppId = document.getElementById("api-app-id").value
    const apiAppSecret = document.getElementById("api-app-secret").value
    saveSync("credentials", { apiAppId, apiAppSecret }).then(() => {
        document.getElementById("status").textContent = "Credentials saved!"
    })
}

function loadCredentials () {
    getSync("credentials").then(credentials => {
        if (!credentials) {
            return
        }
        document.getElementById("api-app-id").value = credentials.apiAppId
        document.getElementById("api-app-secret").value = credentials.apiAppSecret
    })
}

loadCredentials()
document.getElementById("save").addEventListener("click", saveCredentials)

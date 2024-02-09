import { getSync, saveSync } from "../shared/storage.js"
import { track } from "../shared/tracker.js"

function saveCredentials () {
    const apiAppId = document.getElementById("api-app-id").value
    const apiAppKey = document.getElementById("api-app-key").value
    saveSync("credentials", { apiAppId, apiAppKey }).then(() => {
        track({
            event: "NEW_USER",
            distinct_id: apiAppId,
        })
        document.getElementById("status").textContent = "Credentials saved!"
        setTimeout(() => chrome.tabs.getCurrent(tab => chrome.tabs.remove(tab.id)), 500)
    })
}

function loadCredentials () {
    getSync("credentials").then(credentials => {
        if (!credentials) {
            return
        }
        document.getElementById("api-app-id").value = credentials.apiAppId
        document.getElementById("api-app-key").value = credentials.apiAppKey
    })
}

loadCredentials()
document.getElementById("save").addEventListener("click", saveCredentials)

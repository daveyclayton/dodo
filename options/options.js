import { getSync, saveSync } from "../shared/storage.js"

function saveCredentials () {
    const apiAppId = document.getElementById("api-app-id").value
    const apiAppSecret = document.getElementById("api-app-secret").value
    saveSync("credentials", { apiAppId, apiAppSecret }).then(() => {
        document.getElementById("credentials-status").textContent = "Credentials saved!"
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

function saveDefaults () {
    const designFileId = document.getElementById("default-design-file-id").value
    const accountId = document.getElementById("default-account-id").value
    saveSync("defaults", { designFileId, accountId }).then(() => {
        document.getElementById("defaults-status").textContent = "Defaults saved!"
    })
}

function loadDefaults () {
    getSync("defaults").then(defaults => {
        if (!defaults) {
            return
        }
        document.getElementById("default-design-file-id").value = defaults.designFileId
        document.getElementById("default-account-id").value = defaults.accountId
    })
}

loadCredentials()
loadDefaults()
document.getElementById("save-credentials").addEventListener("click", saveCredentials)
document.getElementById("save-defaults").addEventListener("click", saveDefaults)

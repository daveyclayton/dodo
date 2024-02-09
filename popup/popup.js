import { getSync } from "../shared/storage.js"

function toggleElement (elementId, visible) {
    const display = visible ? "block" : "none"
    document.getElementById(elementId).style.display = display
}

async function showEnterData () {
    const credentials = await getSync("credentials")
    if (!credentials) {
        showError("Please enter your credentials in the extension options.")
        return
    }
    toggleElement("loading", false)
    toggleElement("script", false)
    toggleElement("error", false)
    toggleElement("enter-data", true)
    document.getElementById("design-file-id").focus()
}

function showLoading () {
    toggleElement("enter-data", false)
    toggleElement("script", false)
    toggleElement("error", false)
    toggleElement("loading", true)
}

function showError (errorMessage) {
    toggleElement("loading", false)
    toggleElement("enter-data", false)
    toggleElement("script", false)
    toggleElement("error", true)

    const errorContentElement = document.getElementById("error-content")
    errorContentElement.textContent = errorMessage
}

function showScript (scriptContent) {
    toggleElement("loading", false)
    toggleElement("enter-data", false)
    toggleElement("error", false)
    toggleElement("script", true)

    const scriptContentElement = document.getElementById("script-content")
    scriptContentElement.textContent = scriptContent
}

async function fetchCreatives (designFileId) {
    const errorMessage = `Failed to fetch creatives of Design file '${designFileId}'. Please check the ID and your permissions.`

    const response = await fetch(`https://hub.celtra.io/api/creatives?returnFullUnits=1&templateBatchId=${designFileId}`)
    if (!response.ok) {
        console.error(response.status, response.statusText)
        throw new Error(errorMessage)
    }

    const responseJson = await response.json()
    if (responseJson.length === 0) {
        throw new Error(`${errorMessage} The response was an empty array.`)
    }

    return responseJson
}

async function createScript () {
    const designFileId = document.getElementById("design-file-id").value
    if (!designFileId || typeof designFileId !== "string" || designFileId.length !== 8 && designFileId.length !== 12) {
        showError("Design file ID is required and has to be 8 or 12 characters long.")
        return
    }

    showLoading()

    try {
        const creatives = await fetchCreatives(designFileId)
        console.log(creatives)
        showScript(creatives.toString())
    } catch (error) {
        console.log(error)
        showError(error)
    }
}

showEnterData()
document.getElementById("design-file-id").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        createScript()
    }
})
document.getElementById("submit").addEventListener("click", createScript)

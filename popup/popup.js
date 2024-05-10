import {
    fetchCreatives,
    createDesignFile,
    fetchFonts,
    fetchFalconDesignFile,
} from "../shared/celtraApi.js"
import { generateZip } from "../shared/designFileGeneration.js"
import { getSync } from "../shared/storage.js"
import { getCredentials } from "../shared/utils.js"

function loadDefaults () {
    getSync("defaults").then(defaults => {
        if (!defaults) {
            return
        }
        document.getElementById("design-file-id").value = defaults.designFileId
        document.getElementById("account-id").value = defaults.accountId
    })
}

function toggleElement (elementId, visible) {
    const display = visible ? "block" : "none"
    document.getElementById(elementId).style.display = display
}

async function showEnterData () {
    toggleElement("loading", false)
    toggleElement("done", false)
    toggleElement("error", false)
    toggleElement("enter-data", true)
    document.getElementById("design-file-id").focus()
}

function showLoading () {
    toggleElement("enter-data", false)
    toggleElement("done", false)
    toggleElement("error", false)
    toggleElement("loading", true)
}

function showError (errorMessage) {
    toggleElement("loading", false)
    toggleElement("enter-data", false)
    toggleElement("done", false)
    toggleElement("error", true)

    const errorContentElement = document.getElementById("error-content")
    errorContentElement.textContent = errorMessage
}

function showDone (destinationUrl) {
    toggleElement("loading", false)
    toggleElement("enter-data", false)
    toggleElement("error", false)
    toggleElement("done", true)

    const destinationContentElement = document.getElementById("destination-url")
    destinationContentElement.href = destinationUrl
}

async function migrate () {
    const designFileId = document.getElementById("design-file-id").value
    const accountId = document.getElementById("account-id").value

    const validateId = (id, entityName) => {
        if (!id || typeof id !== "string" || id.length !== 8 && id.length !== 12) {
            showError(`${entityName} ID is required and has to be 8 or 12 characters long.`)
            return false
        }
        return true
    }

    if (!validateId(designFileId, "Design file") || !validateId(accountId, "Account")) {
        return
    }
    showLoading()

    try {
        const creatives = await fetchCreatives(designFileId)
        const falconDesignFile = await fetchFalconDesignFile(designFileId)
        const platformFonts = await fetchFonts(falconDesignFile.accountId)
        const zip = await generateZip(creatives, platformFonts)
        const designFileName = `[MIGRATED] ${falconDesignFile.name}`
        const newDesignFileUrl = await createDesignFile(accountId, designFileName, zip)
        showDone(newDesignFileUrl)
    } catch (error) {
        console.log(error)
        showError(error)
    }
}

getCredentials()
loadDefaults()
showEnterData()
document.getElementById("design-file-id").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        migrate()
    }
})
document.getElementById("submit").addEventListener("click", migrate)

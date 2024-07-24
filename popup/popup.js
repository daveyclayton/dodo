import {
    fetchCreatives,
    createDesignFile,
    fetchFonts,
    fetchFalconDesignFile,
} from "../shared/celtraApi.js"
import { generateZip } from "../shared/designFileGeneration.js"
import { getSync } from "../shared/storage.js"
import { getCredentials, getExtensionInfo, logExtensionInfo } from "../shared/utils.js"

const designFileInput = document.getElementById("design-file-id")
const accountInput = document.getElementById("account-id")

function init () {
    printVersion()
    getCredentials()
    loadDefaults()
    showEnterData()
}

async function printVersion () {
    const extensionInfo = await getExtensionInfo()
    document.getElementById("version").innerHTML = `v${extensionInfo.version}`
    logExtensionInfo()
}

function loadDefaults () {
    getSync("defaults").then(defaults => {
        if (!defaults) {
            return
        }
        designFileInput.value = defaults.designFileId
        accountInput.value = defaults.accountId
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
    designFileInput.focus()
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

function showDone (destinationUrl, warnings) {
    toggleElement("loading", false)
    toggleElement("enter-data", false)
    toggleElement("error", false)
    toggleElement("done", true)

    if (warnings) {
        const warningsElement = document.getElementById("warnings")
        warningsElement.textContent = warnings.join("\n")
    }

    const destinationContentElement = document.getElementById("destination-url")
    destinationContentElement.href = destinationUrl
}

async function migrate () {
    const designFileId = designFileInput.value
    const accountId = accountInput.value
    const isManualScaling = document.getElementById("manual-scaling").checked

    const isIdValid = (id) => {
        return id && typeof id === "string" && (id.length === 8 || id.length === 12)
    }

    if (!isIdValid(designFileId) || !isIdValid(accountId)) {
        showError("Account and Design File IDs are required and have to be 8 or 12 characters long.")
        return
    }

    try {
        showLoading()
        const creatives = await fetchCreatives(designFileId)
        const falconDesignFile = await fetchFalconDesignFile(designFileId)
        const platformFonts = await fetchFonts(falconDesignFile.accountId)
        const { zip, warnings } = await generateZip(creatives, platformFonts, isManualScaling)
        const designFileName = `[MIGRATED] ${falconDesignFile.name}`
        const newDesignFileUrl = await createDesignFile(accountId, designFileName, zip)
        showDone(newDesignFileUrl, warnings)
    } catch (error) {
        console.log(error)
        showError(error)
    }
}

function onKeyDown (event) {
    if (event.key === "Enter") {
        migrate()
    }
}

init()

designFileInput.addEventListener("keypress", onKeyDown)
accountInput.addEventListener("keypress", onKeyDown)
document.getElementById("submit").addEventListener("click", migrate)

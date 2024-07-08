import { getSync } from "./storage.js"

export function generateId () {
    const arr = new Uint8Array(16)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, (dec) => dec.toString(16).padStart(2, "0")).join("")
}

export function getFloat (falconNumberString) {
    if (parseFloat(falconNumberString) === falconNumberString) {
        return falconNumberString
    }
    return parseFloat(falconNumberString.replace("px", ""))
}

export function getInt (falconNumberString) {
    if (parseInt(falconNumberString) === falconNumberString) {
        return falconNumberString
    }

    return parseInt(falconNumberString.replace("px", ""))
}

export function convertPercentToPx (numberOrString, parentSizeInPx, allowFloat = true) {
    if (typeof numberOrString === "number") {
        return numberOrString
    }

    let number = null
    if (numberOrString.endsWith("%")) {
        number = numberOrString.replace("%", "") / 100 * parentSizeInPx
    } else {
        number = getFloat(numberOrString)
    }

    if (allowFloat) {
        return parseFloat(number.toFixed(2))
    } else {
        return Math.round(number)
    }
}

export async function getCredentials () {
    const credentials = await getSync("credentials")
    if (!credentials || !credentials.apiAppId || !credentials.apiAppSecret) {
        console.warn("Credentials not present! Cannot make a POST/PUT/PATH/DELETE request to proxy.")
        chrome.runtime.openOptionsPage()
        return
    }

    return credentials
}

async function getManifestJson () {
    const manifestResponse = await fetch("../manifest.json")
    return await manifestResponse.json()
}

export async function getExtensionInfo () {
    const manifestJson = await getManifestJson()
    return {
        version: manifestJson.version,
        name: manifestJson.name,
    }
}

export async function logExtensionInfo () {
    const extensionInfo = await getExtensionInfo()
    console.log(extensionInfo.name, extensionInfo.version)
}

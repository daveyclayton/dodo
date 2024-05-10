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

export function convertPercentToPx (numberString, parentSizeInPx, allowFloat = true) {
    let number = null
    if (numberString.endsWith("%")) {
        number = numberString.replace("%", "") / 100 * parentSizeInPx
    } else {
        number = getFloat(numberString)
    }

    if (allowFloat) {
        return number
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

import { getSync } from "./storage.js"

export function generateId () {
    const arr = new Uint8Array(16)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, (dec) => dec.toString(16).padStart(2, "0")).join("")
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

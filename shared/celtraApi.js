import { getSync } from "./storage.js"

export async function fetchFromCeltraApi (path) {
    const credentials = await getSync("credentials")
    if (!credentials || !credentials.apiAppId || !credentials.apiAppKey) {
        throw new Error("Please enter the credentials in the extension options.")
    }

    const headers = new Headers()
    headers.set("Authorization", "Basic " + btoa(credentials.apiAppId + ":" + credentials.apiAppKey))
    const response = await fetch(`https://hub.celtra.io/api/${path}`)
    return response
}

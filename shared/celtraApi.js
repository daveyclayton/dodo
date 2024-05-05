import { getSync } from "./storage.js"

const PLATFORM_DOMAIN = "celtra.io"
const API_URL = `https://hub.${PLATFORM_DOMAIN}/api/`
const CACHED_API_URL = `https://cache-ssl.${PLATFORM_DOMAIN}/api/`
const API_PROXY_URL = "https://request-passthrough-afb95a0643d0.herokuapp.com/api/"
// const API_PROXY_URL = "https://hub.matic.test/api/"

export async function dispatch (path, method = "GET", body = undefined, headers = [], cached = false) {
    const requestHeaders = new Headers()
    headers.forEach(header => requestHeaders.append(header[0], header[1]))

    let baseUrl = API_URL
    if (cached && method === "GET") {
        baseUrl = CACHED_API_URL
    }
    // The use of proxy is necessary for non-GET requests since the extension will add the origin header and CA API will reject the request.
    if (method !== "GET") {
        baseUrl = API_PROXY_URL
        const credentials = await getSync("credentials")
        if (!credentials || !credentials.apiAppId || !credentials.apiAppSecret) {
            console.warn("Credentials not present! Cannot make a POST/PUT/PATH/DELETE request to proxy.")
            chrome.runtime.openOptionsPage()
            return
        }
        // For proxy requests, we need auth as well since cookies won't be sent.
        requestHeaders.append("Authorization", `Basic ${btoa(`${credentials.apiAppId}:${credentials.apiAppSecret}`)}`)
    }

    const response = await fetch(
        `${baseUrl}${path}`,
        {
            method,
            headers: requestHeaders,
            body,
        },
    )
    if (!response.ok && !response.created) {
        let body = ""
        try {
            body = await response.json()
        } catch {
            body = await response.text()
        }
        console.error(response.status, response.statusText, body)
        throw new Error(`Failed to dispatch '${path}'.`)
    }

    return response
}

export async function fetchCreatives (designFileId) {
    const errorMessage = `Failed to fetch creatives of Design file '${designFileId}'. Please check the ID and your permissions.`

    try {
        const response = await dispatch(`creatives?returnFullUnits=1&templateBatchId=${designFileId}`)
        const responseJson = await response.json()
        if (responseJson.length === 0) {
            throw new Error(`${errorMessage} The response was an empty array.`)
        }

        return responseJson
    } catch {
        throw new Error(errorMessage)
    }
}

async function fetchAccount (accountId) {
    const errorMessage = `Failed to fetch the account with id '${accountId}'. Please check the ID and your permissions.`

    try {
        const response = await dispatch(`accounts/${accountId}?fields=id,name,clientUrl`)
        const responseJson = await response.json()
        if (Object.keys(responseJson).length === 0) {
            throw new Error(`${errorMessage} The response was an empty object.`)
        }

        return responseJson
    } catch {
        throw new Error(errorMessage)
    }
}

export async function fetchFonts (accountId) {
    const errorMessage = "Failed to fetch the fonts."

    try {
        const response = await dispatch(`fontTypefaces?accountId=${accountId}`)
        const responseJson = await response.json()
        if (responseJson.length === 0) {
            throw new Error(`${errorMessage} The response was an empty array.`)
        }

        return responseJson
    } catch {
        throw new Error(errorMessage)
    }
}

export async function fetchBlob (blobhash) {
    try {
        return await dispatch(`blobs/${blobhash}`, "GET", null, [], true)
    } catch {
        throw new Error(`Failed to fetch the blob with hash '${blobhash}'. Please check the hash.`)
    }
}

export async function createDesignFile (accountId, name, zip) {
    const errorMessage = "Failed to create the Design file. Please check your permissions."
    // accountId = "gdrkmcjinemf" // FOR TESTING

    try {
        const response = await dispatch(`designFiles/upload?accountId=${accountId}&name=${name}`, "POST", zip, [["Content-Type", "application/zip"]])
        const responseJson = await response.json()
        return await getEagleDesignFileUrl(accountId, responseJson.id)
    } catch {
        throw new Error(errorMessage)
    }

}

async function getEagleDesignFileUrl (accountId, eagleCampaignId) {
    const account = await fetchAccount(accountId)
    const errorMessage = `Failed to fetch the design file from eagle campaign with id '${eagleCampaignId}'.`

    try {
        const response = await dispatch(`designFiles?campaignId=${eagleCampaignId}`)
        const responseJson = await response.json()
        if (responseJson.length === 0) {
            throw new Error(`${errorMessage} The response was an empty array.`)
        }
        const designFileId = responseJson[0].id
        return `${account.clientUrl}projects/${designFileId}`
    } catch {
        throw new Error(errorMessage)
    }
}

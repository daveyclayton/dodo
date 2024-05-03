const API_URL = "https://hub.celtra.io/api/"
const CACHED_API_URL = "https://cache-ssl.celtra.io/api/"

export async function dispatch (path, method = "GET", body = null, headers = [], cached = false) {
    const requestHeaders = new Headers()
    headers.forEach(header => requestHeaders.append(header[0], header[1]))
    const baseUrl = cached ? CACHED_API_URL : API_URL
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: requestHeaders,
    }, body ? body : undefined)
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

export async function fetchAccount (accountId) {
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

export async function createDesignFile (accountId, name, json) {
    const errorMessage = "Failed to create the Design file. Please check your permissions."

    try {
        const responseJson = await dispatch(`designFiles/upload?accountId=${accountId}&name=${name}`, "POST", json, [["Content-Type", "application/zip"]])
        return responseJson.id
    } catch {
        throw new Error(errorMessage)
    }

}

export function getEagleDesignFileUrl (account, designFileId) {
    return `${account.clientUrl}projects/${designFileId}`
}

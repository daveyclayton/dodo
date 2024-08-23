import { getCredentials, getExtensionInfo } from "./utils.js"

const PLATFORM_DOMAIN = "celtra.io"
const API_URL = `https://hub.${PLATFORM_DOMAIN}/api/`
const CACHED_API_URL = `https://cache-ssl.${PLATFORM_DOMAIN}/api/`
const API_PROXY_URL = "https://request-passthrough-afb95a0643d0.herokuapp.com/api/"
// const API_PROXY_URL = "https://hub.matic.test/api/" // FOR TESTING

export async function dispatch (path, method = "GET", body = undefined, headers = [], cached = false) {
    const extensionInfo = await getExtensionInfo()
    const requestHeaders = new Headers()
    requestHeaders.append("User-Agent", `${extensionInfo.name} v${extensionInfo.version}`)
    headers.forEach(header => requestHeaders.append(header[0], header[1]))

    let baseUrl = API_URL
    if (cached && method === "GET") {
        baseUrl = CACHED_API_URL
    }
    // The use of proxy is necessary for non-GET requests since the extension will add the origin header and CA API will reject the request.
    if (method !== "GET") {
        baseUrl = API_PROXY_URL
    }
    // For proxy requests, we need auth as well since cookies won't be sent.
    const credentials = await getCredentials()
    requestHeaders.append("Authorization", `Basic ${btoa(`${credentials.apiAppId}:${credentials.apiAppSecret}`)}`)

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

export async function fetchCreatives (pluginJson) {
    //instead of getting creatives, use creative boilerplate and inject content from extension arg
    const errorMessage = `Failed to fetch creatives of Design file '${pluginJson}'. Please check the ID and your permissions.`
    
    var creativesBoiler = [
        {
          "id": "b1ebbcb8",
          "folderId": "9138427e",
          "clazz": "ExportableImage",
          "name": "Display & Video Image",
          "isArchived": false,
          "isDeleted": false,
          "canGetPublicSettings": true,
          "canModifyPublicSettings": true,
          "canModifyInternalSettings": false,
          "canBuild": true,
          "canExport": true,
          "canCopy": true,
          "canDistributeCreative": true,
          "canDistributeCreativeConstraint": null,
          "thumbnailUrl": "https://cache-ssl.celtra.io/api/blobs/ae3812ce5c27fa997d5c80adc63ad934d7fb53009a0dac552d193cf0e15eecde/thumbnail.png",
          "creationTimestamp": "2022-09-27 10:13:06",
          "lastModificationTimestamp": "2024-08-20 09:08:23",
          "userLastModificationTimestamp": "2024-08-20 09:08:23",
          "version": 2,
          "previewUrl": "http://davidclayton.celtra.io/preview/b1ebbcb8",
          "product": "STDA",
          "platforms": [
            {
              "platform": "Android",
              "minimumVersion": "5.0"
            },
            {
              "platform": "DesktopPlatform",
              "minimumVersion": null
            },
            {
              "platform": "IOS",
              "minimumVersion": "9"
            }
          ],
          "sdks": [],
          "sizeDescription": {
            "banner": [
              "1080x1080"
            ]
          },
          "intendedDeviceType": "Any",
          "customTagVariables": [],
          "customAttributes": {
      
          },
          "fonts": [],
          "scripts": [],
          "clientExtensions": {
            "lastScreenTitleId": 1,
            "localIdGenerator": 15,
            "objectNameGenerator": 0,
            "sceneNameGenerator": 0,
            "collapsedLayers": {
      
            },
            "collapsedUnitVariants": {
      
            },
            "lastSavedBy": {
              "firstName": "David ",
              "lastName": "Clayton"
            },
            "assetSortingProperties": {
              "type": "localid",
              "order": "asc"
            },
            "assetFolders": []
          },
          "builderCreativeVersion": 1,
          "schemaVersion": 63,
          "defaultVideoMetaData": null,
          "files": [],
          "units": {
            "banner": {
              "clazz": "CreativeUnitWithVariants",
              "localId": 1,
              "variants": [
                {
                  "localId": 2,
                  "clazz": "CreativeUnitVariant",
                  "screens": [],
                  "backgroundColor": "#000000",
                  "borderColor": "#000000",
                  "borderSize": 0,
                  "scale": 0.25,
                  "sizing": "fixed",
                  "defaultUnits": "px",
                  "layoutAspectRatiosLocked": {
                    "independent": true
                  },
                  "layoutCustomUnitSizes": {
                    "independent": false
                  },
                  "orientation": "independent",
                  "forceResponsivePositioningAndSizing": false,
                  "layouts": [
                    {
                      "orientation": "independent",
                      "minSize": {
                        "width": 1080,
                        "height": 1080
                      },
                      "unitSize": {
                        "width": 1080,
                        "height": 1080
                      },
                      "designTimeSize": {
                        "width": 1080,
                        "height": 1080
                      },
                      "unitAlignment": {
                        "horizontal": "center",
                        "vertical": "center"
                      },
                      "isDecoupled": false
                    }
                  ],
                  "layoutsLocked": {
                    "portrait": true,
                    "landscape": true,
                    "independent": true
                  },
                  "feedImageOptimizationSettings": [],
                  "customAttributes": {
      
                  },
                  "master": {
                    "hiddenInBuilder": false,
                    "lockedInBuilder": false,
                    "triggers": [],
                    "scenes": [
                      {
                        "autoPlay": null,
                        "clazz": "Scene",
                        "duration": 10,
                        "fallbackFrame": null,
                        "framesPerSecond": 30,
                        "gopDuration": 2000,
                        "initialScene": null,
                        "intersection": null,
                        "localId": 4,
                        "name": "Scene",
                        "objects": [],
                        "onEnd": "stop",
                        "onEndRepeatCount": 0,
                        "onEndReverseCount": 0,
                        "onEndWaitForCount": true,
                        "type": "time"
                      }
                    ],
                    "showOverflow": false,
                    "title": "Image",
                    "type": "rich",
                    "localId": 3,
                    "objects": [
                      {
                        "layoutSpecificValues": [
                          {
                            "position": {
                              "left": "124px",
                              "top": "184px"
                            },
                            "size": {
                              "width": "844px",
                              "height": "734px"
                            },
                            "margin": {
                              "left": "0px",
                              "top": "0px"
                            },
                            "rotation": 0,
                            "opacity": 1,
                            "hidden": false
                          }
                        ],
                        "flipPosition": true,
                        "triggers": [],
                        "name": "bgr",
                        "aspectRatioLocked": false,
                        "blendingMode": "normal",
                        "zIndex": 2,
                        "hiddenInBuilder": false,
                        "lockedInBuilder": false,
                        "imageSourceFeedFieldKey": null,
                        "horizontalContentFlip": false,
                        "verticalContentFlip": false,
                        "flipContent": true,
                        "fileLocalId": 100,
                        "fittingSize": "fit",
                        "imagePosition": "center",
                        "cropWidth": null,
                        "cropHeight": null,
                        "cropX": null,
                        "cropY": null,
                        "cropScale": null,
                        "cropRotate": null,
                        "useAltText": false,
                        "altText": null,
                        "sharperRendering": false,
                        "flipAlignment": true,
                        "importedFromLayoutFile": false,
                        "clazz": "Picture",
                        "localId": 13
                      }
                    ],
                    "clazz": "Screen",
                    "guidelines": [],
                    "videoTimeLimit": {
                      "min": 0
                    }
                  },
                  "videoUnit": true,
                  "videoTimeLimit": {
                    "min": 0
                  },
                  "flipLayout": false
                }
              ],
              "altText": null
            }
          },
          "hasVideoContent": false,
          "sourceCreativeId": null,
          "isCreativeWeightLimited": false,
          "isAbleToExportVideoUnit": true,
          "isAbleToExportAnyScreen": true,
          "useIntactAsset": false
        }
      ]
      creativesBoiler[0].units.banner.variants[0].layouts = []
      creativesBoiler[0].units.banner.variants[0].layouts.push({})
      creativesBoiler[0].units.banner.variants[0].layouts[0].minSize={}
      creativesBoiler[0].units.banner.variants[0].layouts[0].unitSize={}
      creativesBoiler[0].units.banner.variants[0].layouts[0].designTimeSize={}
    
      creativesBoiler[0].units.banner.variants[0].layouts[0].minSize.width = pluginJson.document.size.width
      creativesBoiler[0].units.banner.variants[0].layouts[0].minSize.height = pluginJson.document.size.height
      creativesBoiler[0].units.banner.variants[0].layouts[0].unitSize.width = pluginJson.document.size.width
      creativesBoiler[0].units.banner.variants[0].layouts[0].unitSize.height = pluginJson.document.size.height
      creativesBoiler[0].units.banner.variants[0].layouts[0].designTimeSize.width = pluginJson.document.size.width
      creativesBoiler[0].units.banner.variants[0].layouts[0].designTimeSize.height = pluginJson.document.size.height

    //loop through the files and add them to localId starting index 100
    //alert(creativesBoiler.length)
    creativesBoiler[0].files = []
    creativesBoiler[0].units.banner.variants[0].master.objects = []
    for (var i = 0;i<pluginJson.layout.length;i++){
        var localFileJson = getFilesJson()
        localFileJson.localId = 100+i
        localFileJson.name = pluginJson.layout[i].name
        localFileJson.blobHash = pluginJson.layout[i].hash
        creativesBoiler[0].files.push(localFileJson)
        
        var localObject = getObjectsJson()
        localObject.fileLocalId = 100+i
        localObject.name = pluginJson.layout[i].name 
        localObject.layoutSpecificValues[0].position.top = pluginJson.layout[i].position.top
        localObject.layoutSpecificValues[0].position.left = pluginJson.layout[i].position.left
        localObject.layoutSpecificValues[0].size.width = pluginJson.layout[i].size.width
        localObject.layoutSpecificValues[0].size.height = pluginJson.layout[i].size.height
        creativesBoiler[0].units.banner.variants[0].master.objects.push(localObject)
    }

    return creativesBoiler

    /*
    try {
        const response = await dispatch(`creatives?returnFullUnits=1&isArchived=0&isDeleted=0&templateBatchId=${pluginJson}`)
        const responseJson = await response.json()
        if (responseJson.length === 0) {
            throw new Error(`${errorMessage} The response was an empty array.`)
        }

        return responseJson
    } catch (error) {
        console.error(error)
        throw new Error(errorMessage)
    }
    */
}

export function getFilesJson(){

    return {
        "clazz": "File",
        "retina": true,
        "retinaScaleFactor": 2,
        "localId": 12,
        "name": "bgr.png",
        "blobHash": "bd26d00badfa0fbf011aba8533549a226be3a94930e501a7a480db34f0304879",
        "quality": -1,
        "autoResize": false,
        "optimizationSettings": [
          {
            "creativeUnitVariantId": "default",
            "optimizedSize": 418592
          }
        ],
        "isAsset": true,
        "sourceAssetId": null
      }
}


export function getObjectsJson(){
    return {
        "layoutSpecificValues": [
          {
            "position": {
              "left": "124px",
              "top": "184px"
            },
            "size": {
              "width": "844px",
              "height": "734px"
            },
            "margin": {
              "left": "0px",
              "top": "0px"
            },
            "rotation": 0,
            "opacity": 1,
            "hidden": false
          }
        ],
        "flipPosition": true,
        "triggers": [],
        "name": "bgr",
        "aspectRatioLocked": false,
        "blendingMode": "normal",
        "zIndex": 2,
        "hiddenInBuilder": false,
        "lockedInBuilder": false,
        "imageSourceFeedFieldKey": null,
        "horizontalContentFlip": false,
        "verticalContentFlip": false,
        "flipContent": true,
        "fileLocalId": 100,
        "fittingSize": "fit",
        "imagePosition": "center",
        "cropWidth": null,
        "cropHeight": null,
        "cropX": null,
        "cropY": null,
        "cropScale": null,
        "cropRotate": null,
        "useAltText": false,
        "altText": null,
        "sharperRendering": false,
        "flipAlignment": true,
        "importedFromLayoutFile": false,
        "clazz": "Picture",
        "localId": 13
      }

}


export async function fetchFalconDesignFile (pluginJson) {
    //instead of getting design file, use DF boilerplate and inject content from extension arg (size, name?)

    var dfBoiler = {"id":"5b60be5c","name":"xxx","accountId":"ea505f20"}
    dfBoiler.name = pluginJson.document.name
    /*
    const errorMessage = `Failed to fetch the Falcon Design file '${pluginJson}'. Please check the ID and your permissions.`

    try {
        const response = await dispatch(`folders/${pluginJson}?fields=id,name,accountId`)
        return await response.json()
    } catch (error) {
        console.error(error)
        throw new Error(errorMessage)
    }
        */
    return dfBoiler
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
    } catch (error) {
        console.error(error)
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
    } catch (error) {
        console.error(error)
        throw new Error(errorMessage)
    }
}

export async function sendFilesToStorage (files){
//alert(files.length)
  for (var i=0; i<files.length;i++){
    //alert(files[i])
      try {
        await dispatch ('blobs/', "POST", files[i], [["Content-Type", "application/octet-stream"]], false)
      } catch (error) {
        
        throw new Error(`Failed to send blob to storage \n ${error}`)
    }
  }

}


export async function fetchBlob (blobhash) {
    try {
        return await dispatch(`blobs/${blobhash}`, "GET", null, [], true)
    } catch (error) {
        console.error(error)
        throw new Error(`Failed to fetch the blob with hash '${blobhash}'. Please check the hash.`)
    }
}

export async function createDesignFile (accountId, name, zip) {
    const errorMessage = "Failed to create the Design file. Please check your permissions. There might also be an issue with the extension. Please report this with the Falcon Design File ID to #birds-of-prey."
    // accountId = "gdrkmcjinemf" // FOR TESTING

    try {
        const response = await dispatch(`designFiles/upload?accountId=${accountId}&name=${name}`, "POST", zip, [["Content-Type", "application/zip"]])
        const responseJson = await response.json()
        return await getEagleDesignFileUrl(accountId, responseJson.id)
    } catch (error) {
        console.error(error)
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
    } catch (error) {
        console.error(error)
        throw new Error(errorMessage)
    }
}

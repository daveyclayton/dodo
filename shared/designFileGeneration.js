/* eslint-disable no-case-declarations */
import { fetchBlob } from "./celtraApi.js"
import { generateNOrderIndexes } from "./fractionalIndexes.js"
import { generateId, getInt, convertPercentToPx } from "./utils.js"
import {
    getVariants,
    getPlatformFontBlobHash,
    getFiles,
    getFonts,
    getVariantDurationInSeconds,
    getObjects,
    partitionComponentsByParentId,
    partitionFalconComponentsByNameAndClazz,
} from "./falconUtils.js"
import {
    getXYFromFalconPosition,
    getEagleColor,
    generatePropertyObject,
    generatePropertyObjectFromComponent,
    getEagleTextAlign,
    getEagleTextDecoration,
    getEagleVerticalTextAlign,
    getEagleDesignUnitFormatFromFalconClazz,
    getEagleFormatFromFalconClazz,
    getEagleTextObjects,
    getAnimatableMediaLineItemCompoundKeys,
    convertFittingSize,
} from "./eagleUtils.js"
import {
    SUPPORTED_FORMATS,
    DESIGN_FILE_VERSION,
    COMPONENTS_WITH_STROKE,
    DEFAULT_FONT_BLOB_HASH,
} from "./constants.js"

let orderIndexIndex = 0
let orderIndexes = []
const falconToEagleIds = {}
const falconToFalconIds = {} // We use this when we merge components together so references can be updated.

function generateOrderIndexes () {
    orderIndexes = generateNOrderIndexes([], 7500)
}

function getEligibleCreatives (creatives) {
    return creatives.filter(creative => SUPPORTED_FORMATS.includes(creative.clazz))
}

function getBaseEagleComponent (falconComponent, mediaLineItemCompoundKeys) {
    const compoundKeysWhereComponentIsPresent = mediaLineItemCompoundKeys.filter((key, index) => Object.keys(falconComponent.componentValues).some(i => i == index))
    const eagleComponent = {
        id: generateId(),
        name: falconComponent.name,
        animations: [],
        attributes: {
            horizontalAnchoring: generatePropertyObject("left"),
            verticalAnchoring: generatePropertyObject("top"),
            aspectRatioLocked: generatePropertyObjectFromComponent(falconComponent, "aspectRatioLocked", mediaLineItemCompoundKeys, false),
            skewX: generatePropertyObject(0),
            skewY: generatePropertyObject(0),
            blending: generatePropertyObjectFromComponent(falconComponent, "blendingMode", mediaLineItemCompoundKeys, "normal"),
            presence: generatePropertyObject(true, compoundKeysWhereComponentIsPresent, false),
            locked: generatePropertyObject(false),
            resizingWidth: generatePropertyObject("fixed"),
            resizingHeight: generatePropertyObject("fixed"),
            blur: generatePropertyObject(null),
            orderIndex: generatePropertyObjectFromComponent(falconComponent, "zIndex", mediaLineItemCompoundKeys, orderIndexes[orderIndexIndex++], (c) => {
                // TODO: simplify, this is a mess now :/
                if (c.zIndex === -1) {
                    return orderIndexes.splice(orderIndexes.length - 1, 1)[0]
                }

                const maxOrderIndex = orderIndexes.length - 1 - 100 // leave 100 values for cases where zIndex is -1
                const randomFromOneToHundred = Math.floor(Math.random() * 100) + 1
                if (c.zIndex) {
                    const zIndexFactor = c.zIndex * (c.mediaLineItemIndex + 1)
                    let orderIndexIndex = orderIndexes.length - zIndexFactor
                    if (orderIndexIndex < 0) {
                        orderIndexIndex = randomFromOneToHundred
                    }
                    if (orderIndexIndex > maxOrderIndex) {
                        orderIndexIndex = maxOrderIndex
                    }
                    return orderIndexes.splice(orderIndexIndex, 1)[0]
                } else {
                    const zIndexFactor = randomFromOneToHundred * (c.mediaLineItemIndex + 1)
                    return orderIndexes.splice(maxOrderIndex - zIndexFactor, 1)[0]
                }
            }),
            parentId: generatePropertyObjectFromComponent(falconComponent, "parentId", mediaLineItemCompoundKeys, "null", (c) => {
                if (!c.parentId) {
                    return null
                }
                const falconId = falconToFalconIds[c.parentId] ?? c.parentId
                return falconToEagleIds[falconId] ?? null
            }),
        },
    }

    eagleComponent.attributes.hidden = generatePropertyObjectFromComponent(falconComponent, "hidden", mediaLineItemCompoundKeys, false, (c) => !!c.layoutSpecificValues[0].hidden)
    eagleComponent.attributes.x = generatePropertyObjectFromComponent(falconComponent, "x", mediaLineItemCompoundKeys, 0, (c) => {
        const layoutSpecificValue = c.layoutSpecificValues[0]
        const width = convertPercentToPx(layoutSpecificValue.size.width, c.parentSize.width, false)
        const height = convertPercentToPx(layoutSpecificValue.size.height, c.parentSize.height, false)
        const { x } = getXYFromFalconPosition(layoutSpecificValue.position, { width, height }, c.parentSize)
        return x
    })
    eagleComponent.attributes.y = generatePropertyObjectFromComponent(falconComponent, "y", mediaLineItemCompoundKeys, 0, (c) => {
        const layoutSpecificValue = c.layoutSpecificValues[0]
        const width = convertPercentToPx(layoutSpecificValue.size.width, c.parentSize.width, false)
        const height = convertPercentToPx(layoutSpecificValue.size.height, c.parentSize.height, false)
        const { y } = getXYFromFalconPosition(layoutSpecificValue.position, { width, height }, c.parentSize)
        return y
    })
    eagleComponent.attributes.width = generatePropertyObjectFromComponent(falconComponent, "width", mediaLineItemCompoundKeys, 100, (c) => {
        const layoutSpecificValue = c.layoutSpecificValues[0]
        return convertPercentToPx(layoutSpecificValue.size.width, c.parentSize.width, false)
    })
    eagleComponent.attributes.height = generatePropertyObjectFromComponent(falconComponent, "height", mediaLineItemCompoundKeys, 100, (c) => {
        const layoutSpecificValue = c.layoutSpecificValues[0]
        return convertPercentToPx(layoutSpecificValue.size.height, c.parentSize.height, false)
    })
    eagleComponent.attributes.rotation = generatePropertyObjectFromComponent(falconComponent, "rotation", mediaLineItemCompoundKeys, 0, (c) => c.layoutSpecificValues[0].rotation)
    eagleComponent.attributes.opacity = generatePropertyObjectFromComponent(falconComponent, "opacity", mediaLineItemCompoundKeys, 100, (c) => c.layoutSpecificValues[0].opacity)

    eagleComponent.attributes.shadowX = generatePropertyObjectFromComponent(falconComponent, "shadowDistance", mediaLineItemCompoundKeys, 0, (c) => c.shadow ? c.shadowDistance : 0)
    eagleComponent.attributes.shadowY = generatePropertyObjectFromComponent(falconComponent, "shadowDistance", mediaLineItemCompoundKeys, 0, (c) => c.shadow ? c.shadowDistance : 0)
    eagleComponent.attributes.shadowColor = generatePropertyObjectFromComponent(falconComponent, "shadowColor", mediaLineItemCompoundKeys, null, (c) => c.shadow ? c.shadowColor : null)
    eagleComponent.attributes.shadowBlur = generatePropertyObjectFromComponent(falconComponent, "shadowBlur", mediaLineItemCompoundKeys, 4, (c) => c.shadow ? c.shadowBlur : 4)

    return eagleComponent
}

function getEagleComponentFromFalconComponent (falconComponent, files, fonts, platformFonts, mediaLineItemCompoundKeys) {
    const eagleComponent = getBaseEagleComponent(falconComponent, mediaLineItemCompoundKeys)
    falconToEagleIds[falconComponent.id] = eagleComponent.id

    if (COMPONENTS_WITH_STROKE.includes(falconComponent.clazz)) {
        eagleComponent.attributes.strokeRadius = generatePropertyObjectFromComponent(falconComponent, "roundness", mediaLineItemCompoundKeys, 0, (c) => c.roundness ?? 0)
        eagleComponent.attributes.strokePosition = generatePropertyObject("inside")
        eagleComponent.attributes.strokeWidth = generatePropertyObjectFromComponent(falconComponent, "borderWidth", mediaLineItemCompoundKeys, null, (c) => c.border ? c.borderWidth : null)
        eagleComponent.attributes.strokeFill = generatePropertyObjectFromComponent(falconComponent, "borderColor", mediaLineItemCompoundKeys, null, (c) => c.border ? c.borderColor : null)
    }

    switch (falconComponent.clazz) {
    case "Texty":
        const textyStyleId = generateId()
        const textStyleAttributes = {
            fontSize: generatePropertyObjectFromComponent(falconComponent, "fontSize", mediaLineItemCompoundKeys, 15, (c) => getInt(c.fontSize)),
            letterSpacing: generatePropertyObject({ value: 0, unit: "%" }, mediaLineItemCompoundKeys),
            lineHeight: generatePropertyObject({ value: 100, unit: "%" } ),
            decoration: generatePropertyObjectFromComponent(falconComponent, "textDecoration", mediaLineItemCompoundKeys, "null", (c) => getEagleTextDecoration(c.textDecoration)),
            transform: generatePropertyObject(null),
            fill: generatePropertyObjectFromComponent(falconComponent, "textColor", mediaLineItemCompoundKeys, "#FFFFFF", (c) => getEagleColor(c.textColor), mediaLineItemCompoundKeys),
            strokeFill: generatePropertyObjectFromComponent(falconComponent, "textStrokeColor", mediaLineItemCompoundKeys, "null", (c) => c.textStroke ? getEagleColor(c.textStrokeColor) : null),
            strokeWidth: generatePropertyObjectFromComponent(falconComponent, "textStrokeSize", mediaLineItemCompoundKeys, "null", (c) => c.textStrokeSize ?? null),
            strokePosition: generatePropertyObject("inside", mediaLineItemCompoundKeys),
            highlightFill: generatePropertyObject(null),
            highlightLeftPadding: generatePropertyObject(0),
            highlightRightPadding: generatePropertyObject(0),
            highlightTopPadding: generatePropertyObject(0),
            highlightBottomPadding: generatePropertyObject(0),
            highlightBorderRadius: generatePropertyObject(0),
            appleFontTracking: generatePropertyObjectFromComponent(falconComponent, "useAppleFontTrackingValue", mediaLineItemCompoundKeys, false, (c) => c.useAppleFontTrackingValue ?? false),
            fontBlobHash: generatePropertyObjectFromComponent(falconComponent, "platformFontBlobHash", mediaLineItemCompoundKeys, DEFAULT_FONT_BLOB_HASH, (c) => getPlatformFontBlobHash(c.fontLocalId, fonts, platformFonts)),
        }

        eagleComponent.type = "Texty"
        eagleComponent.attributes.paddingTop = generatePropertyObjectFromComponent(falconComponent, "textPaddingTop", mediaLineItemCompoundKeys, 0, (c) => c.textPaddingTop ?? 0)
        eagleComponent.attributes.paddingBottom = generatePropertyObjectFromComponent(falconComponent, "textPaddingBottom", mediaLineItemCompoundKeys, 0, (c) => c.textPaddingBottom ?? 0)
        eagleComponent.attributes.paddingLeft = generatePropertyObjectFromComponent(falconComponent, "textPaddingLeft", mediaLineItemCompoundKeys, 0, (c) => c.textPaddingLeft ?? 0)
        eagleComponent.attributes.paddingRight = generatePropertyObjectFromComponent(falconComponent, "textPaddingRight", mediaLineItemCompoundKeys, 0, (c) => c.textPaddingRight ?? 0)
        eagleComponent.attributes.shrinkToFit = generatePropertyObjectFromComponent(falconComponent, "responsiveFont", mediaLineItemCompoundKeys, false)
        eagleComponent.attributes.resizingWidth = generatePropertyObject("hugContent")
        eagleComponent.attributes.resizingHeight = generatePropertyObject("hugContent")
        eagleComponent.attributes.textDirection = generatePropertyObject("auto")
        eagleComponent.attributes.horizontalAlignment = generatePropertyObjectFromComponent(falconComponent, "textAlign", mediaLineItemCompoundKeys, "left", (c) => getEagleTextAlign(c.textAlign))
        eagleComponent.attributes.verticalAlignment = generatePropertyObjectFromComponent(falconComponent, "textAlignVertical", mediaLineItemCompoundKeys, "top", (c) => getEagleVerticalTextAlign(c.textAlignVertical))
        eagleComponent.attributes.content = generatePropertyObjectFromComponent(falconComponent, "text", mediaLineItemCompoundKeys, "null", (c) => getEagleTextObjects(c.text, textyStyleId))
        eagleComponent.styles = [
            {
                id: textyStyleId,
                name: "Default",
                attributes: textStyleAttributes,
            },
        ]
        break
    case "Shapey":
        eagleComponent.type = "Rectangle"
        eagleComponent.attributes.fill = generatePropertyObjectFromComponent(falconComponent, "backgrounColor", mediaLineItemCompoundKeys, null, (c) => getEagleColor(c.backgroundColor))
        break
    case "Picture":
        eagleComponent.type = "Picture"
        eagleComponent.attributes.fitting = generatePropertyObjectFromComponent(falconComponent, "fittingSize", mediaLineItemCompoundKeys, "fit", (c) => convertFittingSize(c.fittingSize))
        eagleComponent.attributes.backgroundPosition = generatePropertyObject({
            x: "center",
            y: "center",
        }, mediaLineItemCompoundKeys)
        eagleComponent.attributes.crop = generatePropertyObject({
            translation: {
                x: 0,
                y: 0,
            },
            scale: {
                x: 1,
                y: 1,
            },
            skew: {
                x: 0,
                y: 0,
            },
            rotation: 0,
        }, mediaLineItemCompoundKeys)

        const pictureFileExtractor = (c) => {
            if (!c.fileLocalId) {
                return null
            }
            const file = files.find(f => f.localId === c.fileLocalId)
            return {
                name: file?.name,
                blobHash: file?.blobHash,
            }
        }
        eagleComponent.attributes.image = generatePropertyObjectFromComponent(falconComponent, "fileLocalId", mediaLineItemCompoundKeys, "null", pictureFileExtractor)
        break
    case "VideoAsset":
        eagleComponent.type = "Video"
        eagleComponent.attributes.fitting = generatePropertyObjectFromComponent(falconComponent, "fitting", mediaLineItemCompoundKeys)
        eagleComponent.attributes.volume = generatePropertyObject(1, mediaLineItemCompoundKeys)
        eagleComponent.attributes.isAudioDetached = generatePropertyObject(false, mediaLineItemCompoundKeys)
        eagleComponent.attributes.backgroundPosition = generatePropertyObject({
            x: "center",
            y: "center",
        }, mediaLineItemCompoundKeys)

        const videoFileExtractor = (c) => {
            if (!c.videoLocalId) {
                return null
            }
            const file = files.find(f => f.localId === c.videoLocalId)
            return {
                name: file?.name,
                blobHash: file?.blobHash,
            }
        }
        eagleComponent.attributes.video = generatePropertyObjectFromComponent(falconComponent, "videoLocalId", mediaLineItemCompoundKeys, "null", videoFileExtractor)

        // Video needs a component clip animation for valid schema
        const animatableMediaLineItemCompoundKeys = getAnimatableMediaLineItemCompoundKeys(mediaLineItemCompoundKeys)
        eagleComponent.animations.push({
            id: generateId(),
            type: "ComponentClip",
            attributes: {
                presence: generatePropertyObject(true, animatableMediaLineItemCompoundKeys, false),
                delay: generatePropertyObject(0, animatableMediaLineItemCompoundKeys),
                duration: generatePropertyObjectFromComponent(falconComponent, "sceneDuration", animatableMediaLineItemCompoundKeys, 6000, (c) => c.sceneDuration),
            },
        })
        break
    case "Group":
    case "NestedContainer": // For Choice only, refactor when choices are available in Eagle
        eagleComponent.type = "Group"
        eagleComponent.attributes.fill = generatePropertyObjectFromComponent(falconComponent, "backgroundColor", mediaLineItemCompoundKeys, null, (c) => c.background ? getEagleColor(c.backgroundColor) : null)
        eagleComponent.attributes.overflow = generatePropertyObject("hidden")
        eagleComponent.attributes.layout = generatePropertyObject("manual")
        eagleComponent.attributes.spacing = generatePropertyObject(10)
        eagleComponent.attributes.alignment = generatePropertyObject("top-left")
        eagleComponent.attributes.paddingTop = generatePropertyObject(0, mediaLineItemCompoundKeys)
        eagleComponent.attributes.paddingBottom = generatePropertyObject(0, mediaLineItemCompoundKeys)
        eagleComponent.attributes.paddingLeft = generatePropertyObject(0, mediaLineItemCompoundKeys)
        eagleComponent.attributes.paddingRight = generatePropertyObject(0, mediaLineItemCompoundKeys)
        break
    default:
        return null
    }

    return eagleComponent
}

function getFurniture (format, creative) {
    switch (format) {
    case "image":
    case "video":
    case "html":
        return {}
    case "meta.image":
    case "meta.video":
        return {
            primaryText: {
                type: "Text",
                text: generatePropertyObject(creative.units.banner.facebookMessage ?? "", [], null, "content"),
            },
            headline: {
                type: "Text",
                text: generatePropertyObject(creative.units.banner.facebookImageHeadline ?? creative.units.banner.facebookVideoHeadline ?? "", [], null, "content"),
            },
            description: {
                type: "Text",
                text: generatePropertyObject(creative.units.banner.facebookImageLinkDescription ?? creative.units.banner.facebookVideoLinkDescription ?? "", [], null, "content"),
            },
            callToAction: {
                type: "Text",
                text: generatePropertyObject(creative.units.banner.facebookCallToAction ?? "", [], null, "content"),
            },
            websiteUrl: {
                type: "Text",
                text: generatePropertyObject(creative.units.banner.facebookWebsiteUrl ?? "", [], null, "content"),
            },
            displayLink: {
                type: "Text",
                text: generatePropertyObject(creative.units.banner.facebookDisplayLink ?? "", [], null, "content"),
            },
            deeplink: {
                type: "Text",
                text: generatePropertyObject(creative.units.banner.facebookDeeplink ?? "", [], null, "content"),
            },
        }
    case "youtube.video":
        return {
            title: {
                type: "Text",
                text: generatePropertyObject(creative.units.banner.youTubeTitle ?? "", [], null, "content"),
            },
            description: {
                type: "Text",
                text: generatePropertyObject(creative.units.banner.youTubeDescription ?? "", [], null, "content"),
            },
        }
    default:
        console.error(`Unsupported creative format: '${format}'.`)
        return {}
    }
}

function getMediaLineItem (format, designUnitFormat, variant, creative) {
    const width = variant.layouts[0].designTimeSize.width
    const height = variant.layouts[0].designTimeSize.height
    const duration = designUnitFormat === "image" ? null : getVariantDurationInSeconds(variant)
    const name = `${format.split(".").join(" ")} ${width}x${height}`
    const designUnitFormatLowercase = designUnitFormat.toLowerCase()
    let mediaLineItemPath = designUnitFormatLowercase
    const mediaLineItem = {
        id: generateId(),
        name,
        attributes: {},
        orderIndex: orderIndexes[orderIndexIndex++],
        groupOrderIndex: orderIndexes[orderIndexIndex++],
        productCatalogMetadata: null,
        formatRegistrationId: `com.celtra.${format}`,
        root: {
            type: "Group",
            children: {},
        },
    }

    const designUnit = {
        type: designUnitFormat,
        width,
        height,
        aspectRatioLocked: false,
    }

    if (designUnitFormatLowercase !== "image") {
        designUnit.duration = duration
        designUnit.fps = 30
    }

    if (designUnitFormatLowercase === "html") {
        designUnit.fallbackImageSource = "Generated"
        mediaLineItem.root.children.fallbackImage = {
            type: "File",
            file: {
                dependsOn: "content",
                dimensions: [],
                markedForScaling: false,
                values: {
                    default: null,
                },
            },
        }
        mediaLineItem.root.children.fallbackTimestamp = {
            type: "Number",
            number: {
                dependsOn: "content",
                dimensions: [],
                markedForScaling: false,
                values: {
                    default: 0,
                },
            },
        }
    }

    // Meta supports alternative placements so the structure is different
    if (format.startsWith("meta.")) {
        mediaLineItem.root.children.placements = {
            type: "Group",
            children: {
                default: {
                    type: "Group",
                    children: {
                        [designUnitFormatLowercase]: designUnit,
                    },
                },
            },
        }
        mediaLineItemPath = `placements.default.${designUnitFormatLowercase}`
    } else {
        mediaLineItem.root.children[designUnitFormatLowercase] = designUnit
    }

    const furniture = getFurniture(format, creative)
    if (furniture) {
        mediaLineItem.root.children = {
            ...furniture,
            ...mediaLineItem.root.children,
        }
    }

    return {
        mediaLineItem,
        mediaLineItemPath,
    }
}

function getMediaLineItems (creatives) {
    const mediaLineItems = []
    const mediaLineItemCompoundKeys = []

    creatives.forEach(creative => {
        const designUnitFormat = getEagleDesignUnitFormatFromFalconClazz(creative.clazz)
        const format = getEagleFormatFromFalconClazz(creative.clazz).toLowerCase()
        getVariants(creative).forEach(variant => {
            const { mediaLineItem, mediaLineItemPath } = getMediaLineItem(format, designUnitFormat, variant, creative)
            mediaLineItems.push(mediaLineItem)
            mediaLineItemCompoundKeys.push(`${mediaLineItem.id}/${mediaLineItemPath}`)
        })
    })

    return {
        mediaLineItems,
        mediaLineItemCompoundKeys,
    }
}

function getCanvasComponents (creatives, files, fonts, platformFonts, mediaLineItemCompoundKeys) {
    let mediaLineItemIndex = 0
    const falconComponents = []
    creatives.forEach(creative => {
        getVariants(creative).forEach(variant => {
            const creativeComponents = []
            getObjects(variant).forEach(object => {
                creativeComponents.push({
                    ...object,
                    parentSize: {
                        width: variant.layouts[0].designTimeSize.width,
                        height: variant.layouts[0].designTimeSize.height,
                    },
                    sceneDuration: getVariantDurationInSeconds(variant),
                    mediaLineItemIndex,
                })
            })

            // mimic backgroundColor as a Shapey component
            if (variant.backgroundColor) {
                creativeComponents.push({
                    clazz: "Shapey",
                    name: "Background",
                    aspectRatioLocked: false,
                    layoutSpecificValues: [
                        {
                            size: {
                                width: "100%",
                                height: "100%",
                            },
                            position: {
                                left: "0px",
                                top: "0px",
                            },
                            rotation: 0,
                            opacity: 1,
                        },
                    ],
                    backgroundColor: variant.backgroundColor,
                    border: variant.borderSize > 0,
                    borderWidth: variant.borderSize,
                    borderColor: variant.borderColor,
                    parentSize: {
                        width: variant.layouts[0].designTimeSize.width,
                        height: variant.layouts[0].designTimeSize.height,
                    },
                    sceneDuration: getVariantDurationInSeconds(variant),
                    zIndex: -1,
                    mediaLineItemIndex,
                })
            }

            falconComponents.push(...creativeComponents)
            mediaLineItemIndex++
        })
    })

    const falconComponentsByNameAndClazz = {}
    partitionFalconComponentsByNameAndClazz(falconComponents, null, falconComponentsByNameAndClazz, falconToFalconIds)

    const canvasComponents = []
    const { componentsWithoutParentId, componentsWithParentId } = partitionComponentsByParentId(falconComponentsByNameAndClazz)
    componentsWithoutParentId.concat(componentsWithParentId).forEach(falconComponent => {
        const eagleCanvasComponent = getEagleComponentFromFalconComponent(falconComponent, files, fonts, platformFonts, mediaLineItemCompoundKeys)
        if (eagleCanvasComponent) {
            canvasComponents.push(eagleCanvasComponent)
        }
    })

    return canvasComponents
}

async function generateJson (creatives, fonts, files, platformFonts, isManualScaling = true) {
    generateOrderIndexes()
    const { mediaLineItems, mediaLineItemCompoundKeys } = getMediaLineItems(creatives)
    const canvasComponents = getCanvasComponents(creatives, files, fonts, platformFonts, mediaLineItemCompoundKeys)
    const contentScalingDimensions = []
    if (isManualScaling) {
        contentScalingDimensions.push({
            id: generateId(),
            type: "custom",
            name: "Rows",
            values: [
                {
                    id: generateId(),
                    name: "Row 1",
                    attributes: {},
                },
            ],
            attributes: [],
        })
    }

    return {
        version: DESIGN_FILE_VERSION,
        contentScaling: "manual",
        outputScaling: isManualScaling ? "manual" : "automatic",
        isDesignLocked: false,
        mediaLineItemAttributes: [],
        customProductCatalogColumns: [],
        externalValues: [],
        threadContexts: [],
        contentScalingDimensions: contentScalingDimensions,
        customLayoutScalingDimensions: [],
        excludedCombinationTables: [],
        activations: [],
        clientExtensions: {
            guides: {},
            assets: [],
            canvasClipping: {},
        },
        namingConvention: {
            type: "segments",
            namingSegments: [],
            version: 1,
        },
        canvasComponents,
        mediaLineItems,
    }
}

export async function generateZip (creatives, platformFonts, isManualScaling = true) {
    const warnings = []
    const eligibleCreatives = getEligibleCreatives(creatives)
    if (eligibleCreatives.length === 0) {
        throw new Error("No eligible creatives found.")
    }
    if (eligibleCreatives.length !== creatives.length) {
        warnings.push("Some creatives are of unsupported formats and were skipped during migration.")
    }

    const files = getFiles(eligibleCreatives)
    const fonts = getFonts(eligibleCreatives)
    const json = await generateJson(eligibleCreatives, fonts, files, platformFonts, isManualScaling)
    const zip = new JSZip()
    zip.file("designFile.json", JSON.stringify(json))

    const filePromises = []
    const fetchedFileBlobHashes = []
    for (const file of files) {
        if (fetchedFileBlobHashes.includes(file.blobHash)) {
            continue
        }
        filePromises.push(fetchBlob(file.blobHash))
        fetchedFileBlobHashes.push(file.blobHash)
    }
    const fetchedFiles = await Promise.all(filePromises)
    fetchedFiles.forEach(response => {
        const blobHash = response.url.split("/").pop()
        zip.file(`blobs/${blobHash}`, response.blob())
    })

    const fontPromises = []
    const fetchedFontBlobHashes = []
    for (const font of fonts) {
        const fontBlobHash = getPlatformFontBlobHash(font.localId, fonts, platformFonts)
        if (fetchedFontBlobHashes.includes(fontBlobHash)) {
            continue
        }
        fontPromises.push(fetchBlob(fontBlobHash))
        fetchedFontBlobHashes.push(fontBlobHash)
    }
    const fetchedFonts = await Promise.all(fontPromises)
    fetchedFonts.forEach(response => {
        const blobHash = response.url.split("/").pop()
        zip.file(`fonts/${blobHash}`, response.blob())
    })

    const zipBlob = await zip.generateAsync({ type: "arraybuffer" })
    return {
        zip: zipBlob,
        warnings,
    }
}

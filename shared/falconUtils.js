import { DEFAULT_FONT_BLOB_HASH } from "./constants.js"
import { convertPercentToPx, generateId } from "./utils.js"

export function getVariants (creative) {
    return creative.units.banner.variants ?? [creative.units.banner]
}

export function getObjects (variant) {
    if (variant.master && variant.master.objects && variant.master.objects.length > 0) {
        return variant.master.objects
    }
    if (variant.screens) {
        if (variant.screens.length === 0) {
            return []
        }

        return variant.screens[0].objects
    }

    throw new Error("Cannot find objects in variant", variant)
}

export function getVariantDurationInSeconds (variant) {
    if (variant.master.scenes.length === 0) {
        return 6000 // return some default duration if we have no scenes
    }
    return variant.master.scenes[0].duration * 1000
}

export function getPlatformFontBlobHash (fontLocalId, fonts, platformFonts) {
    const fontTypefaceId = fonts.find(f => f.localId === fontLocalId)?.typefaceId
    const font = platformFonts.find(f => f.id === fontTypefaceId)
    if (!font.files) {
        return DEFAULT_FONT_BLOB_HASH
    }
    if (font.files.ttf && font.files.ttf.blobHash) {
        return font.files.ttf.blobHash
    }
    if (font.files.otf && font.files.otf.blobHash) {
        return font.files.otf.blobHash
    }
    if (font.files.woff && font.files.woff.blobHash) {
        return font.files.woff.blobHash
    }
    if (font.files.woff2 && font.files.woff2.blobHash) {
        return font.files.woff2.blobHash
    }
}

export function getFiles (creatives) {
    const files = []
    creatives.forEach(creative => {
        files.push(...creative.files)
    })

    return files
}

export function getFonts (creatives) {
    const fonts = []
    creatives.forEach(creative => {
        fonts.push(...creative.fonts)
    })

    return fonts
}

export function generateBackgroundShapeyComponent (variant, mediaLineItemIndex) {
    return {
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
    }
}

export function partitionComponentsByParentId (componentsByNameAndClazz) {
    const componentsWithoutParentId = []
    const componentsWithParentId = []
    Object.values(componentsByNameAndClazz).forEach(falconComponent => {
        if (falconComponent.componentValues.some(v => v.parentId !== null)) {
            componentsWithParentId.push(falconComponent)
        } else {
            componentsWithoutParentId.push(falconComponent)
        }
    })

    return {
        componentsWithoutParentId,
        componentsWithParentId,
    }
}

export function partitionFalconComponentsByNameAndClazz (components, parentId, falconComponentsByNameAndClazz) {
    const addComponentToMap = (component, temporaryId) => {
        const { clazz, name, ...properties } = component
        const componentKey = `${clazz} - ${name}`

        if (!falconComponentsByNameAndClazz[componentKey]) {
            falconComponentsByNameAndClazz[componentKey] = {
                clazz: clazz,
                name: name,
                id: temporaryId,
                componentValues: [],
            }
        }
        falconComponentsByNameAndClazz[componentKey].componentValues[component.mediaLineItemIndex.toString()] = {
            ...properties,
            parentId,
        }
    }

    components.sort((a, b) => a.zIndex - b.zIndex)
    components.forEach(component => {
        const temporaryId = `falcon_${generateId()}`
        if (component.clazz !== "ChoiceFeed") {
            addComponentToMap(component, temporaryId)
        }

        if (component.clazz === "Group") {
            const groupObjects = mapFalconComponentObjects(component, component.content.objects)
            partitionFalconComponentsByNameAndClazz(groupObjects, temporaryId, falconComponentsByNameAndClazz)
        } else if (component.clazz === "ChoiceFeed") {
            component.content.forEach(choiceContent => {
                // We need to remap some values from both the ChoiceFeed and the child NestedContainer component.
                const layoutSpecificValues = [{
                    ...choiceContent.layoutSpecificValues[0],
                    ...component.layoutSpecificValues[0],
                }]
                choiceContent = {
                    ...component,
                    ...choiceContent,
                    layoutSpecificValues,
                }

                const choiceContentComponentTemporaryId = `falcon_${generateId()}`
                addComponentToMap(choiceContent, choiceContentComponentTemporaryId)
                const choiceContentObjects = mapFalconComponentObjects(choiceContent, choiceContent.objects)

                partitionFalconComponentsByNameAndClazz(choiceContentObjects, choiceContentComponentTemporaryId, falconComponentsByNameAndClazz)
            })

        }
    })
}

function mapFalconComponentObjects (component, objects) {
    return objects.map(object => {
        const layoutSpecificValue = component.layoutSpecificValues[0]
        return {
            ...object,
            mediaLineItemIndex: component.mediaLineItemIndex,
            parentSize: {
                width: convertPercentToPx(layoutSpecificValue.size.width, component.parentSize.width, false),
                height: convertPercentToPx(layoutSpecificValue.size.height, component.parentSize.height, false),
            },
            sceneDuration: component.sceneDuration,
        }
    })
}

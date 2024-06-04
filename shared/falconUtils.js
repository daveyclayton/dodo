import { DEFAULT_FONT_BLOB_HASH } from "./constants.js"

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

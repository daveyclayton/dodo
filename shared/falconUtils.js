export function getVariants (creative) {
    return creative.units.banner.variants ?? [creative.units.banner]
}

export function getVariantDurationInSeconds (variant) {
    return variant.master.scenes[0].duration * 1000
}

export function getPlatformFontBlobHash (fontLocalId, fonts, platformFonts) {
    const fontTypefaceId = fonts.find(f => f.localId === fontLocalId)?.typefaceId
    const font = platformFonts.find(f => f.id === fontTypefaceId)
    if (!font.files) {
        return "e712e715f828844e3eb493b74e3bf657b71660aa98505ce7581f7cbe889d9f83" // Roboto regular
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

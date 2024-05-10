import { getFloat, convertPercentToPx } from "./utils.js"

export function getVariants (creative) {
    return creative.units.banner.variants ?? [creative.units.banner]
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

export function getXYFromFalconPosition (position, parentSize) {
    let left, top
    if (position.hcenter) {
        let hcenterPx = position.hcenter
        if (hcenterPx.endsWith("%")) {
            hcenterPx = convertPercentToPx(hcenterPx, parentSize.width)
        }
        left = parentSize.width / 2 + getFloat(hcenterPx)
    } else {
        left = position.left ?? parentSize.width - getFloat(position.right)
    }

    if (position.vcenter) {
        let vcenterPx = position.vcenter
        if (vcenterPx.endsWith("%")) {
            vcenterPx = convertPercentToPx(vcenterPx, parentSize.height)
        }
        top = parentSize.height / 2 + getFloat(vcenterPx)
    } else {
        top = position.top ?? parentSize.height - getFloat(position.bottom)
    }

    return {
        x: convertPercentToPx(`${left}px`, parentSize.width),
        y: convertPercentToPx(`${top}px`, parentSize.height),
    }
}

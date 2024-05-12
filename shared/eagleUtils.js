import { getFloat, convertPercentToPx } from "./utils.js"

export function generatePropertyObject (value, mediaLineItemCompoundKeys = [], defaultValue = null, dependsOn = "canvas") {
    const propertyObject = {
        markedForScaling: false,
        dependsOn: dependsOn,
        values: {
            default: defaultValue ?? value,
        },
    }

    if (dependsOn === "content") {
        propertyObject.dimensions = []
    }

    mediaLineItemCompoundKeys.forEach(key => {
        propertyObject.values[key] = value
    })

    return propertyObject
}

export function getXYFromFalconPosition (position, size, parentSize) {
    let left, top
    if (position.hcenter) {
        let hcenterPx = position.hcenter
        if (hcenterPx.endsWith("%")) {
            hcenterPx = convertPercentToPx(hcenterPx, parentSize.width)
        }
        left = `${parentSize.width / 2 + getFloat(hcenterPx)}px`
    } else {
        left = position.left ?? parentSize.width - getFloat(position.right) - getFloat(size.width)
    }

    if (position.vcenter) {
        let vcenterPx = position.vcenter
        if (vcenterPx.endsWith("%")) {
            vcenterPx = convertPercentToPx(vcenterPx, parentSize.height)
        }
        top = `${parentSize.height / 2 + getFloat(vcenterPx)}px`
    } else {
        top = position.top ?? parentSize.height - getFloat(position.bottom) - getFloat(size.height)
    }

    return {
        x: convertPercentToPx(left, parentSize.width),
        y: convertPercentToPx(top, parentSize.height),
    }
}

export function getEagleTextDecoration (falconTextDecoration) {
    switch (falconTextDecoration) {
    case "underline":
        return "underline"
    case "line-through":
        return "strikethrough"
    default:
        return null
    }
}

export function getEagleTextAlign (falconTextAlign) {
    switch (falconTextAlign) {
    case "left":
    case "start":
        return "left"
    case "center":
        return "center"
    case "right":
    case "end":
        return "right"
    default:
        return "left"
    }
}

export function getEagleVerticalTextAlign (falconVerticalTextAlign) {
    switch (falconVerticalTextAlign) {
    case 0:
    case "0":
        return "top"
    case 100:
    case "100":
        return "bottom"
    default:
        return "middle"
    }
}

export function getEagleColor (sourceColor) {
    if (sourceColor.startsWith("linear-gradient")) {
        return convertLinearGradient(sourceColor)
    }
    if (sourceColor.startsWith("radial-gradient")) {
        return convertRadialGradient(sourceColor)
    }
    return sourceColor
}

function convertLinearGradient (sourceGradient) {
    const angleRegex = /-?(\d+)deg/
    const angleMatch = sourceGradient.match(angleRegex)
    const angle = angleMatch ? parseInt(angleMatch[1], 10) : 0

    const colorStopRegex = /rgba\((\d+),(\d+),(\d+),(\d*\.?\d+)\)\s(\d+)%/g
    const colorStops = []
    let match

    while ((match = colorStopRegex.exec(sourceGradient)) !== null) {
        colorStops.push({
            color: {
                r: parseInt(match[1], 10),
                g: parseInt(match[2], 10),
                b: parseInt(match[3], 10),
                a: parseFloat(match[4]),
            },
            position: parseInt(match[5], 10),
        })
    }

    const gradientObject = {
        type: "linear",
        colors: colorStops,
        angle: angle,
    }

    return gradientObject
}

function convertRadialGradient (sourceGradient) {
    const shapeSizePositionRegex = /(\w+)\s(\d+)%\s(\d+)%\sat\s(\d+)%\s(\d+)%/
    const shapeSizePositionMatch = sourceGradient.match(shapeSizePositionRegex)
    const verticalRadius = parseInt(shapeSizePositionMatch[2], 10)
    const horizontalRadius = parseInt(shapeSizePositionMatch[3], 10)
    const startX = parseInt(shapeSizePositionMatch[4], 10)
    const startY = parseInt(shapeSizePositionMatch[5], 10)

    const colorStopRegex = /rgba\((\d+),(\d+),(\d+),(\d*\.?\d+)\)\s(\d+)%/g
    const colorStops = []
    let match

    while ((match = colorStopRegex.exec(sourceGradient)) !== null) {
        colorStops.push({
            color: {
                r: parseInt(match[1], 10),
                g: parseInt(match[2], 10),
                b: parseInt(match[3], 10),
                a: parseFloat(match[4]),
            },
            position: parseInt(match[5], 10),
        })
    }

    const gradientObject = {
        type: "radial",
        colors: colorStops,
        verticalRadius: verticalRadius,
        horizontalRadius: horizontalRadius,
        startX: startX,
        startY: startY,
    }

    return gradientObject
}

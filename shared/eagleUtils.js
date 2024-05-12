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

export function convertColor (sourceColor) {
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

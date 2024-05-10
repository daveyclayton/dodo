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

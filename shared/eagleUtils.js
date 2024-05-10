export function generatePropertyObject (value, mediaLineItemCompoundKeys = [], defaultValue = null) {
    const propertyObject = {
        markedForScaling: false,
        dependsOn: "canvas",
        values: {
            default: defaultValue ?? value,
        },
    }
    mediaLineItemCompoundKeys.forEach(key => {
        propertyObject.values[key] = value
    })
    return propertyObject
}

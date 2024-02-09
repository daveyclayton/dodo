function generateAddMediaLineItemScriptEntry (format, width, height, name) {
    const mediaLineItem = {}
    mediaLineItem.aspectRatioLocked = false
    mediaLineItem.attributes = {}
    mediaLineItem.productCatalogMetadata = null
    mediaLineItem.format = format
    mediaLineItem.size = { width, height }
    mediaLineItem.name = name
    mediaLineItem.root = {
        type: "Group",
        children: {},
    }
    mediaLineItem.root.children[format.toLowerCase()] = {
        type: format,
        width,
        height,
        aspectRatioLocked: false,
    }

    return `await store.dispatch('design/addMediaLineItems', { mediaLineItems: [${JSON.stringify(mediaLineItem)}] });`
}

function generateAddComponentScriptEntry (type, name, properties) {
    const scriptPrefix = `
        const attributeDefaults = {
            ...${JSON.stringify(properties)},
            presence: Object.fromEntries(store.getters['design/allStageCanvasesIds'].map(cid => [cid, true]))
        };
    `
    const addComponenetScriptPart = `await store.dispatch('design/addComponent', { type: '${type}', attributeDefaults, name: '${name}' });`
    return scriptPrefix + addComponenetScriptPart
}

export function generateScript (creatives) {
    // TODO: map creatives json to eagle props and call functions correctly
    console.log(creatives)

    let script = ""
    script += generateAddMediaLineItemScriptEntry("Image", 500, 500, "My programmatic MLI") + "\n"
    script += generateAddComponentScriptEntry("Rectangle", "My programmatic component", {}) + "\n"

    return script
}

// p = store.dispatch("design/addComponent", {
//     type: "Rectangle",
//     canvasIds,
//     name: "my programmatic componnet",
//     attributeDefaults: {
//         presence: Object.fromEntries(canvasIds.map(cid => [cid, true])),
//     },
// }).then(() => console.log("added"))

// p = store.dispatch("design/addMediaLineItems", {
//     mediaLineItems: [
//         {
//             format: "Image",
//             size: { width: 500, height: 500 },
//             name: "my programmatic MLI",
//             aspectRatioLocked: false,
//             attributes: {},
//             productCatalogMetadata: null,
//             root: {
//                 type: "Group",
//                 children: {
//                     image: {
//                         "type": "Image",
//                         "width": 500,
//                         "height": 500,
//                         "aspectRatioLocked": false,
//                     },
//                 },
//             },
//         },
//     ],
// }).then(res => console.log("added", res))

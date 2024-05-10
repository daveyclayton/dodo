export function saveSync (key, value) {
    return new Promise(resolve => chrome.storage.sync.set({ [key]: value }, () => resolve()))
}

export function getSync (key) {
    return new Promise(resolve => {
        chrome.storage.sync.get().then(storage => {
            resolve(storage[key])
        })
    })
}

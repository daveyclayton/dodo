export const STORAGE_KEYS = {
    credentials: "credentials",
}

export function saveSync (key, value) {
    return new Promise(resolve => chrome.storage.sync.set({ [STORAGE_KEYS[key]]: value }, () => resolve()))
}

export function getSync (key) {
    return new Promise(resolve => {
        chrome.storage.sync.get().then(storage => {
            resolve(storage[STORAGE_KEYS[key]])
        })
    })
}

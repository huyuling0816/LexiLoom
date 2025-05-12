export function getCSRFToken() {
    let cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim()
        if (c.startsWith("csrftoken=")) {
            return c.substring("csrftoken=".length, c.length)
        }
    }
    return "unknown"
}

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function formatDate(dt) {
    const pad = (num, size = 2) => String(num).padStart(size, '0')
    const padMs = (ms) => String(ms).padStart(6, '0')
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ` +
        `${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}.${padMs(dt.getMilliseconds() * 1000)}`
}

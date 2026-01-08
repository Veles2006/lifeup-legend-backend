export function convertToUserTime(date, timezone) {
    return new Date(
        date.toLocaleString("en-US", { timeZone: timezone })
    );
}

export function formatYYYYMMDD(date) {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // 0–11 → 01–12
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


export function formatHHMM(date) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
}


export function startOfToday(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function endOfToday(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

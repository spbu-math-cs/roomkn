
export function SavePinnedClassroomsIntoStorage(data) {
    console.log(data, JSON.stringify(data))
    localStorage.setItem('roomkn-pinned-classrooms', JSON.stringify(data));
}

export function getPinnedClassroomsFromStorage() {
    const dataString = localStorage.getItem('roomkn-pinned-classrooms');
    if (dataString == null) {
        return []
    }
    try {
        return JSON.parse(dataString)
    } catch (e) {
        return []
    }
}

const s2x1 = [
    {
        x: 100,
        y: -50,
    },
    {
        x: 100,
        y: 50,
    },
    {
        x: -100,
        y: 50,
    },
    {
        x: -100,
        y: -50,
    },
    {
        x: 100,
        y: -50,
    },
]

const s1x1 = [
    {
        x: 50,
        y: -50,
    },
    {
        x: 50,
        y: 50,
    },
    {
        x: -50,
        y: 50,
    },
    {
        x: -50,
        y: -50,
    },
    {
        x: 50,
        y: -50,
    },
]

export const room_301 = {
    room_id: 1,
    room_name: "301",
    x: 200,
    y: 550,
    scale: 1,
    polyline: s2x1
}

export const room_302 = {
    room_id: 2,
    room_name: "302",
    x: 250,
    y: 450,
    scale: 1,
    polyline: s1x1
}

export const room_303 = {
    room_id: 3,
    room_name: "303",
    x: 200,
    y: 150,
    scale: 1,
    polyline: s2x1
}

export const room_304 = {
    room_id: 4,
    room_name: "304",
    x: 300,
    y: 350,
    scale: 1,
    polyline: s2x1
}

export const room_305 = {
    room_id: 5,
    room_name: "305",
    x: 350,
    y: 150,
    scale: 1,
    polyline: s1x1
}

export const room_306 = {
    room_id: 4,
    room_name: "306",
    x: 600,
    y: 350,
    scale: 1,
    polyline: s2x1
}

export const room_307 = {
    room_id: 5,
    room_name: "307",
    x: 550,
    y: 150,
    scale: 1,
    polyline: s1x1
}

export const room_308 = {
    room_id: 3,
    room_name: "308",
    x: 700,
    y: 150,
    scale: 1,
    polyline: s2x1
}

export const room_309 = {
    room_id: 2,
    room_name: "309",
    x: 650,
    y: 450,
    scale: 1,
    polyline: s1x1
}

export const room_310 = {
    room_id: 1,
    room_name: "310",
    x: 700,
    y: 550,
    scale: 1,
    polyline: s2x1
}

export const third_corridor = {
    x: 450,
    y: 250,
    scale: 1,
    polyline: [
        {
            x: -50,
            y: -50,
        },
        {
            x: -50,
            y: -150,
        },
        {
            x: 50,
            y: -150,
        },
        {
            x: 50,
            y: -50,
        },
        {
            x: 350,
            y: -50,
        },
        {
            x: 350,
            y: 250
        },
        {
            x: 250,
            y: 250,
        },
        {
            x: 250,
            y: 50,
        },
        {
            x: -250,
            y: 50,
        },
        {
            x: -250,
            y: 250,
        },
        {
            x: -350,
            y: 250,
        },
        {
            x: -350,
            y: -50,
        },
        {
            x: -50,
            y: -50,
        }
    ]
}

export const third_floor_layer = {
    name: "third_floor",
    height: 0,
    x: 0,
    y: 0,
    objects: [
        third_corridor,
        room_301,
        room_302,
        room_303,
        room_304,
        room_305,
        room_306,
        room_307,
        room_308,
        room_309,
        room_310,
    ]
}

export const cheba_map = {
    layers: [third_floor_layer]
}
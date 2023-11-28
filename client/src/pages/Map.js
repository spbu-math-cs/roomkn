import ContentWrapper from "../components/Content";

import "@pixi/events";
import {Stage, Sprite, Text, Graphics, Container} from '@pixi/react';
import { useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";

import {cheba_map} from "./MapData"


function Room({room_id, navigate, mesh}) {

    const [hover, setHover] = useState(false);
    function click() {
        navigate('/room/' + room_id, {replace: false})
    }

    let height = 0
    let scale = 3
    if (mesh != null) {
        scale = mesh.scale
    }
    let room_name_element = <></>

    const is_room = mesh.room_name != null

    if (is_room) {
        room_name_element = <Text text={mesh.room_name} anchor={{x: 0.5, y: 0.5}} scale={0.8}/>

        if (hover) {
            scale *= 1.10;
            height = 100
        }
    }

    const dummy_bunny = mesh == null

    const draw = useCallback((g) => {
        g.clear();
        g.beginFill(0xffffff);
        g.lineStyle(4, 0x000000, 1);

        if (mesh?.polyline != null) {
            g.moveTo(mesh.polyline[0].x, mesh.polyline[0].y);
            mesh.polyline.forEach((p) => {
                g.lineTo(p.x, p.y);
            })
        }

        g.endFill();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (dummy_bunny) {
        let x = 400 + room_id * 100
        let y = 270

        return (
            <Sprite
                image="https://pixijs.io/pixi-react/img/bunny.png"
                x={x}
                y={y}
                scale={scale}
                anchor={{x: 0.5, y: 0.5}}
                eventMode={'static'}
                click={click}
                pointerover={() => setHover(true)}
                pointerout={() => setHover(false)}
            >
                {room_name_element}
            </Sprite>
        )
    } else {
        return (
            <Graphics
                draw={draw}
                x={mesh.x}
                y={mesh.y}
                zIndex={height}
                scale={scale}
                interactive={true}
                click={click}
                pointerover={() => setHover(true)}
                pointerout={() => setHover(false)}
            >
                {room_name_element}
            </Graphics>
        )
    }
}


function Layer({layer, navigate}) {

    const rooms = []

    layer.objects.forEach(object => {
        rooms.push(
            <Room room_id={1} navigate={navigate} mesh={object}/>
        )
    })

    return (
        <Container
            x={layer.x}
            y={layer.y}
            sortableChildren={true}
        >
            {rooms}
        </Container>
    )

}

function MapField() {
    const navigate = useNavigate()

    const layers = []

    cheba_map.layers.forEach((layer) => {
        layers.push(
            <Layer layer={layer} navigate={navigate}/>
        )
    })

    return (
        <Stage options={{ antialias: true, backgroundAlpha: 0 }} width={1000} height={700}>
            {layers}
            {/*<Room room_id={0} navigate={navigate} mesh={third_corridor}/>*/}
            {/*<Room room_id={1} navigate={navigate}/>*/}
            {/*<Room room_id={2} navigate={navigate}/>*/}
        </Stage>
    );
}

export function Map() {
    return (
        <ContentWrapper page_name="Map">
            <MapField/>
        </ContentWrapper>
    )
}

export default Map;
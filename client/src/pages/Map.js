import ContentWrapper from "../components/Content";

import React from "react";

import "@pixi/events";
import { Stage, Sprite, Text, Graphics, Container } from "@pixi/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {empty_map} from "./MapData";
import useSomeAPI from "../api/FakeAPI";

import "./Map.css"
import {MenuItem, Select} from "@mui/material";

function Room({ room_id, navigate, mesh, window_scale }) {
    const [hover, setHover] = useState(false);
    const click = () => {
        navigate('/room/' + room_id, {replace: false});
    };

    let height = 0;
    let scale = 3;
    if (mesh != null) {
        scale = mesh.scale;
    }
    let room_name_element = <></>;

    const is_room = mesh.room_name != null;

    if (is_room) {
        room_name_element = (
            <Text text={mesh.room_name} anchor={{ x: 0.5, y: 0.5 }} scale={0.8}/>
        )

        if (hover) {
            scale *= 1.10;
            height = 100;
        }
    }

    const dummy_bunny = false;

    const draw = (g) => {
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
    }

    if (dummy_bunny) {
        let x = 400 + room_id * 100;
        let y = 270;

        return (
            <Sprite
                image="https://pixijs.io/pixi-react/img/bunny.png"
                x={x}
                y={y}
                scale={scale}
                anchor={{ x: 0.5, y: 0.5 }}
                eventMode={"static"}
                click={click}
                pointerover={() => setHover(true)}
                pointerout={() => setHover(false)}
            >
                {room_name_element}
            </Sprite>
        );
    } else {
        return (
            <Graphics
                draw={draw}
                x={mesh.x * window_scale}
                y={mesh.y * window_scale}
                zIndex={height}
                scale={scale * window_scale}
                interactive={true}
                click={click}
                pointerover={() => setHover(true)}
                pointerout={() => setHover(false)}
            >
                {room_name_element}
            </Graphics>
        );
    }
}


function Layer({ layer, navigate, scale }) {

    const rooms = []

    layer.objects.forEach(object => {
        rooms.push(
            <Room room_id={1} navigate={navigate} mesh={object} window_scale={scale}/>
        )
    })

    return (
        <Container
            x={layer.x * scale}
            y={layer.y * scale}
            sortableChildren={true}
        >
            {rooms}
        </Container>
    )

}

export function MapField({map, scale=1}) {
    const navigate = useNavigate();

    const [selectedLayer, setSelectedLayer] = useState(1);
    // const [layersList, setLayersList] = useState([]);

    const layers = [];
    const layer_options = [];

    map.layers.forEach((layer) => {
        layer_options.push(
            <MenuItem value={layer.id}>
                {layer.name}
            </MenuItem>
        )
        if (selectedLayer.toString() === layer.id.toString()) {
            layers.push(
                <Layer layer={layer} navigate={navigate} scale={scale}/>
            )
        }
    })

    const width = 1000*scale;
    const height = 700*scale;

    return (
        <>
            <Select value={selectedLayer} onChange={e => setSelectedLayer(e.target.value)} >
                {layer_options}
            </Select>
            <Stage options={{ antialias: true, backgroundAlpha: 0 }} width={width} height={height} className="map-stage">
                {layers}
            </Stage>
        </>
    );
}

export function GetMap() {

    const {triggerFetch} = useSomeAPI('/api/v0/map', null, 'GET', getMapCallback);

    const [map, setMap] = useState(empty_map);

    function getMapCallback(result, statusCode) {
        if (statusCode === 200) {
            setMap(result)
        }
    }

    // console.log(JSON.stringify(cheba_map))


    return {map, triggerGetMap: triggerFetch};
}

export function Map() {

    const {map, triggerGetMap} = GetMap()

    useEffect(() => {
        triggerGetMap()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <ContentWrapper page_name="Map">
            <MapField map={map}/>
        </ContentWrapper>
    )
}

export default Map;
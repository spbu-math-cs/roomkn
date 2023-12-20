import ContentWrapper from "../components/Content";

import React, {useContext} from "react";

import "@pixi/events";
import { Stage, Sprite, Text, Graphics, Container } from "@pixi/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {empty_map} from "./MapData";
import useSomeAPI from "../api/FakeAPI";

import "./Map.css"
import {Box, MenuItem, Select, Skeleton} from "@mui/material";
import {SnackbarContext} from "../components/SnackbarAlert";

function Room({ room_id, navigate, mesh, window_scale }) {
    const [hover, setHover] = useState(false);
    const click = () => {
        if (room_id != null) navigate('/room/' + room_id, {replace: false});
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
                touchend={click}
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
            <Room room_id={object.room_id} navigate={navigate} mesh={object} window_scale={scale}/>
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

export function MapFieldSkeleton({scale=1}) {
    const width = 900 * scale;
    const height = 700 * scale;

    return (
        <>
            <Select disabled fullWidth sx={{mb: 4}}>
            </Select>
            <Box sx={{alignItems: "center"}}>
                <Skeleton variant={"rounded"} width={width} height={height}/>
            </Box>
        </>
    );
}

export function MapField({map, scale=1,loading}) {
    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    const navigate = useNavigate();

    const [selectedLayer, setSelectedLayer] = useState(1);
    // const [layersList, setLayersList] = useState([]);

    if (loading) {
        return (
            <MapFieldSkeleton scale={scale}/>
        )
    }

    try {

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

        const width = 900 * scale;
        const height = 700 * scale;

        return (
            <>
                <Select
                    value={selectedLayer}
                    onChange={e => setSelectedLayer(e.target.value)}
                    fullWidth
                    sx={{mb: 4}}
                >
                    {layer_options}
                </Select>
                <Box sx={{alignItems: "center"}}>
                <Stage options={{antialias: true, backgroundAlpha: 0}} width={width} height={height}
                       className="map-stage">
                    {layers}
                </Stage>
                </Box>
            </>
        );
    } catch (e) {
        setNewMessageSnackbar("Map configuration is corrupted");

        return (
            <MapField map={empty_map}/>
        )
    }
}

export function GetMap() {

    const {triggerFetch, loading} = useSomeAPI('/api/v0/map', null, 'GET', getMapCallback);

    const [map, setMap] = useState(empty_map);

    function getMapCallback(result, statusCode) {
        if (statusCode === 200) {
            setMap(result)
        }
    }

    // console.log(JSON.stringify(cheba_map))


    return {map, triggerGetMap: triggerFetch, loading};
}

export function Map() {

    const {map, triggerGetMap, loading} = GetMap()

    useEffect(() => {
        triggerGetMap()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <ContentWrapper page_name="Map">
            <Box sx={{
                alignItems: 'center',
                flexDirection: 'column',
                flexGrow: 1,
                display: { xs: 'flex', md: 'none' }
            }}>
                <MapField map={map} scale={0.4} loading={loading}/>
            </Box>
            <Box sx={{
                alignItems: 'center',
                flexDirection: 'column',
                flexGrow: 1,
                display: { xs: 'none', md: 'flex' }
            }}>
                <MapField map={map} loading={loading}/>
            </Box>
        </ContentWrapper>
    )
}

export default Map;
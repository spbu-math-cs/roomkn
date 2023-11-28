import ContentWrapper from "../components/Content";

import { Stage, Sprite, Text } from '@pixi/react';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";


function Room({room_id, navigate}) {

    const [hover, setHover] = useState(false);
    function click() {
        navigate('/room/' + room_id, {replace: false})
    }

    let scale = 3
    if (hover) {
        scale *= 1.2;
    }

    const x = 400 + room_id * 100
    const y = 270

    const room_name = room_id

    const dummy_bunny = true

    if (dummy_bunny) {
        return (
            <Sprite
                image="https://pixijs.io/pixi-react/img/bunny.png"
                x={x}
                y={y}
                scale={scale}
                anchor={{x: 0.5, y: 0.5}}
                interactive={true}
                click={click}
                pointerover={() => setHover(true)}
                pointerout={() => setHover(false)}
            >
                <Text text={room_name} anchor={{x: 0.5, y: 0.5}} scale={0.8}/>
            </Sprite>
        )
    } else {

    }
}

function MapField() {
    const navigate = useNavigate()

    return (
        <Stage options={{ antialias: true, backgroundAlpha: 0 }}>
            <Room room_id={0} navigate={navigate}/>
            <Room room_id={1} navigate={navigate}/>
            <Room room_id={2} navigate={navigate}/>
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
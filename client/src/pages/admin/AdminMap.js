import React, {useEffect, useState} from "react";
import useSomeAPI from "../../api/FakeAPI";
import {NavLink} from "react-router-dom";
import {CardHeader, Stack, styled, useTheme} from "@mui/material";
import Button from '@mui/material/Button';
import FileUpload from '@mui/icons-material/FileUpload';
import AdminWrapper from "../../components/AdminWrapper";
import ContentWrapper from "../../components/Content";
import {MapField} from "../Map";
import {cheba_map} from "../MapData";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

function MapUploader({setMap}) {

    const [fileName, setFileName] = useState('Upload file');

    function onUpload(event) {
        console.log("gggg", event.target.result);
        var map = JSON.parse(event.target.result);
        setMap(map)
    }

    function onChange(event) {
        if (event.target.files) {
            var reader = new FileReader();
            reader.onload = onUpload;
            reader.readAsText(event.target.files[0]);
            // setFile(event.target.files[0]);
            setFileName(event.target.files[0].name)
            // console.log("rrrrr", event.target.files[0])
            // // setMap();
        }
    }

    return (
        <Button component="label" variant="contained" startIcon={<FileUpload />} onChange={onChange}>

            <VisuallyHiddenInput type="file" Upload File/>
        </Button>
    )
}

export function AdminMap() {

    // let [drawList, setDrawList] = useState([])
    //
    // let {triggerFetch} = useSomeAPI('/api/v0/rooms', null, 'GET', listCallback)
    //
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // useEffect(() => triggerFetch(), [])

    let [map, setMap] = useState(cheba_map)

    // useEffect(() => setMap(), [])


    const page_name = (
        <div>
            <NavLink to="/admin/panel">
                Admin Panel
            </NavLink>
            /Map
        </div>
    )

    return (
        <AdminWrapper>
            <ContentWrapper page_name={page_name}>

                <MapUploader setMap={setMap}/>

                <CardHeader titleTypographyProps={{variant: "h5", color: "secondary"}} title="Map Preview"/>

                <MapField map={map}/>
            </ContentWrapper>
        </AdminWrapper>
    )
}

export default AdminMap;
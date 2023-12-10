import React, {useContext, useEffect, useState} from "react";
import useSomeAPI from "../../api/FakeAPI";
import {NavLink} from "react-router-dom";
import {ButtonGroup, CardHeader, styled, TextField} from "@mui/material";
import Button from '@mui/material/Button';
import UploadFile from '@mui/icons-material/UploadFile';
import CloudDownload from '@mui/icons-material/CloudDownload';
import Send from '@mui/icons-material/Send';
import Update from '@mui/icons-material/Update';
import AdminWrapper from "../../components/AdminWrapper";
import ContentWrapper from "../../components/Content";
import {MapField, GetMap} from "../Map";
import {empty_map} from "../MapData";
import {SnackbarContext} from "../../components/SnackbarAlert";
import "./AdminMap.css"

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
        }
    }

    return (
        <Button component="label" variant="contained" startIcon={<UploadFile />} onChange={onChange}>
            Upload file
            <VisuallyHiddenInput type="file" Upload File/>
        </Button>
    )
}

function MapPublish({map}) {
    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    const {triggerFetch} = useSomeAPI('/api/v0/map', map, 'PUT', getMapCallback)

    function getMapCallback(result, statusCode) {
        if (statusCode === 200) {
            setNewMessageSnackbar("Map uploaded")
        }
    }

    function send() {
        triggerFetch()
    }

    return (
        <Button component="label" variant="contained" color="secondary" startIcon={<Send />} onClick={send}>
            Publish map
        </Button>
    )
}

function MapUpdate({setMap, editMap}) {

    function update() {
        setMap(JSON.parse(editMap))
    }

    return (
        <Button component="label" variant="contained" color="primary" startIcon={<Update />} onClick={update}>
            Update map from editor
        </Button>
    )
}

function MapDownload({setMap}) {

    const {map: downloaded_map, triggerGetMap} = GetMap()

    function download() {
        triggerGetMap()
    }

    useEffect(() => {
        setMap(downloaded_map)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [downloaded_map])

    return (
        <Button component="label" variant="contained" startIcon={<CloudDownload />} onClick={download}>
            Download map
        </Button>
    )
}

function MapControls({map, setMap, editMap, setEditMap}) {

    useEffect(() => {
        setEditMap(JSON.stringify(map))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    return (
        <div className="admin-map-buttons-wrapper">
            <div className="admin-map-buttons-group">
                <ButtonGroup>
                    <MapDownload setMap={setMap}/>
                    <MapUploader setMap={setMap} setEditMap={setEditMap}/>
                    <MapUpdate editMap={editMap} setMap={setMap}/>
                </ButtonGroup>
            </div>

            <div className="admin-map-publish-group">
                <ButtonGroup>
                    <MapPublish map={map}/>
                </ButtonGroup>
            </div>

        </div>

    )
}

function MapEditor({editMap, setEditMap}) {
    return (
        <TextField value={editMap} onChange={(event) => {
            setEditMap(event.target.value);
        }}/>
    )
}

export function AdminMap() {

    // let [drawList, setDrawList] = useState([])
    //
    // let {triggerFetch} = useSomeAPI('/api/v0/rooms', null, 'GET', listCallback)
    //
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // useEffect(() => triggerFetch(), [])

    let [map, setMap] = useState(empty_map)
    let [editMap, setEditMap] = useState(empty_map)

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

                <MapControls map={map} setMap={setMap} editMap={editMap} setEditMap={setEditMap}/>

                <CardHeader titleTypographyProps={{variant: "h5", color: "secondary"}} title="Map Preview"/>

                <MapField map={map}/>

                <MapEditor editMap={editMap} setEditMap={setEditMap}/>
            </ContentWrapper>
        </AdminWrapper>
    )
}

export default AdminMap;
import React, {useContext, useEffect, useState} from "react";
import useSomeAPI from "../../api/FakeAPI";
import {NavLink} from "react-router-dom";
import {ButtonGroup, styled, Typography} from "@mui/material";
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
import CodeEditor from '@uiw/react-textarea-code-editor';

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

function MapUploader({setMap, setEditMap}) {
    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    function onUpload(event) {
        console.log("gggg", event.target.result);
        try {
            var map = JSON.parse(event.target.result);
            setMap(map)
            setEditMap(event.target.result)
            setNewMessageSnackbar("Map uploaded from file!")
        } catch (e) {
            setNewMessageSnackbar("Unable to upload file: " + e)
        }
    }

    function onChange(event) {
        if (event.target.files) {
            var reader = new FileReader();
            reader.onload = onUpload;
            reader.readAsText(event.target.files[0]);
        }
    }

    return (
        <Button component="label" variant="contained" startIcon={<UploadFile />} onChange={onChange} data-test-id="file-input">
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
            setNewMessageSnackbar("Map successfully published!")
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
    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    function update() {
        try {
            setMap(JSON.parse(editMap))
            setNewMessageSnackbar("Map successfully updated!")
        } catch (e) {
            setNewMessageSnackbar("Unable to update preview: " + e)
        }
    }

    return (
        <Button component="label" variant="contained" color="primary" startIcon={<Update />} onClick={update}>
            Update map from editor to preview
        </Button>
    )
}

function MapDownload({setMap, setEditMap}) {

    const {map: downloaded_map, triggerGetMap} = GetMap()

    function download() {
        triggerGetMap()
    }

    useEffect(() => {
        setMap(downloaded_map)
        setEditMap(JSON.stringify(downloaded_map))

        // setNewMessageSnackbar("Map downloaded from server")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [downloaded_map])

    return (
        <Button component="label" variant="contained" startIcon={<CloudDownload />} onClick={download}>
            Download map from server
        </Button>
    )
}

function MapControls({map, setMap, editMap, setEditMap}) {

    // useEffect(() => {
    //     setEditMap(JSON.stringify(map))
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [map]);

    return (
        <div className="admin-map-buttons-wrapper">
            <div className="admin-map-buttons-group">
                <ButtonGroup>
                    <MapDownload setMap={setMap} setEditMap={setEditMap}/>
                    <MapUploader setMap={setMap} setEditMap={setEditMap}/>
                    <MapUpdate editMap={editMap} setMap={setMap} setEditMap={setEditMap}/>
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
        <div>
            {/*<TextField label="MapEditor" multiline maxRows={Infinity} value={editMap} onChange={(event) => setEditMap(event.target.value)}/>*/}
            {/*<pre id="highlighting" aria-hidden="true">*/}
            {/*    <code class="language-html" id="highlighting-content">*/}
            {/*        {editMap.toString()}*/}
            {/*    </code>*/}
            {/*</pre>*/}
            <CodeEditor
                value={editMap}
                language="js"
                placeholder="Please enter JS code."
                onChange={(evn) => setEditMap(evn.target.value)}
                padding={15}
                style={{
                    backgroundColor: "#050505",
                    fontSize: "16px",
                    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                }}
            />

        </div>

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

                <Typography variant="h5" color="secondary" margin="20px 0 0 0">
                    Map Preview
                </Typography>

                <div className="admin-map-ide-wrapper">
                    <div className="admin-map-preview-wrapper">
                        <div className="admin-map-preview-content ">
                            <MapField map={map} scale={0.65}/>
                        </div>
                    </div>


                    <div className="admin-map-editor-wrapper">
                        <MapEditor editMap={editMap} setEditMap={setEditMap}/>
                    </div>
                </div>


            </ContentWrapper>
        </AdminWrapper>
    )
}

export default AdminMap;
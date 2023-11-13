import ContentWrapper from "../../components/Content";
import useSomeAPI from "../../api/FakeAPI";
import React, {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";

import "./AdminUserList.css"
import AdminWrapper from "../../components/AdminWrapper";

function EditUserRow({user, refresh}) {

        const [name, setName] = useState(user.username)

        const put_data = {
                name: name
        }

        const permissionsDefault = {
                "ReservationsCreate"        : false,
                "ReservationsAdmin"         : false,
                "RoomsAdmin"                        : false,
                "UsersAdmin"                        : false,
                "GroupsAdmin"                     : false
        }
        const [permissions, setPermissions] = useState(permissionsDefault)

        const {triggerFetch: permGetTriggerFetch, finished: permGetFinished, result: permGetResult} = useSomeAPI("/api/v0/users/" + user.id + "/permissions")

        useEffect(() => {
                permGetTriggerFetch()
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])

        useEffect(() => {
                if (permGetFinished) {
                        const tmp_perms = permissionsDefault
                        for (let perm in permGetResult) {
                                tmp_perms[permGetResult[perm]] = true;
                        }
                        setPermissions(tmp_perms)
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [permGetFinished, permGetResult])



        const permissions_draw = []
        if (permissions != null) {
                for (let perm in permissions) {
                        console.log(user.id, permissions[perm])
                        const onchange = () => {
                                const tmp_perms2 = permissions
                                tmp_perms2[perm] = !permissions[perm];
                                console.log("sdsdsdfsdg", tmp_perms2)
                                setPermissions(tmp_perms2)
                        }
                        permissions_draw.push(
                                <div key={perm}>
                                        <label>
                                                {perm}
                                        </label>
                                        <input type="checkbox" checked={permissions[perm]} onChange={onchange} key={Math.random()} name={perm}/>
                                </div>
                        )
                }
        }

        const putObj = useSomeAPI("/api/v0/users/" + user.id, put_data, "PUT")
        const deleteObj = useSomeAPI("/api/v0/users/" + user.id, null, "DELETE")

        const [putStatusCode, triggerPut, putFinished] = [putObj.statusCode, putObj.triggerFetch, putObj.finished]
        const [deleteStatusCode, triggerDelete, deleteFinished] = [deleteObj.statusCode, deleteObj.triggerFetch, deleteObj.finished]

        const reset = () => {
                setName(user.username)
        }

        const put_req = () => {
                triggerPut()
        }

        const delete_req = () => {
                triggerDelete()
        }

        useEffect(() => {
                if (putFinished) {
                        alert("Put statusCode: " + putStatusCode)
                        refresh()
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [putFinished])

        useEffect(() => {
                if (deleteFinished) {
                        alert("Delete statusCode: " + deleteStatusCode)
                        refresh()
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [deleteFinished])


        return (
                <div className="edit-user-row">
                        <div className="edit-user-row-id">
                                {user.id}
                        </div>
                        <input className="edit-user-row-reset" type="button" value="reset" onClick={reset}/>
                        <input className="edit-user-row-name" type="text" value={name} onChange={(e) => setName(e.target.value)}/>

                        {permissions_draw}

                        <input className="edit-user-row-update" type="button" value="UPDATE" onClick={put_req}/>
                        <input className="edit-user-row-delete" type="button" value="delete" onClick={delete_req}/>
                </div>
        )
}

function AddUser({refresh}) {
        const [name, setName] = useState("New user name")

        const put_data = {
                name: name,
        }

        const addObj = useSomeAPI("/api/v0/users", put_data, "POST")

        const [addStatusCode, triggerAdd, addFinished] = [addObj.statusCode, addObj.triggerFetch, addObj.finished]

        const add_req = () => {
                triggerAdd()
        }

        useEffect(() => {
                if (addFinished) {
                        alert("Put statusCode: " + addStatusCode)
                        refresh()
                }
                //eslint-disable-next-line react-hooks/exhaustive-deps
        }, [addFinished])

        return (
                <div className="add-user-row">
                        <input className="add-user-row-name" type="text" value={name} onChange={(e) => setName(e.target.value)}/>
                        <input className="add-user-row-add" type="button" value="ADD" onClick={add_req}/>
                </div>
        )
}

export function AdminUserList() {
        // const [refreshCount, setRefresh] = useState(0)
        // const refresh = () => {
        //         setRefresh(refreshCount+1)
        // }

        let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/users')

        // eslint-disable-next-line react-hooks/exhaustive-deps
        useEffect(() => triggerFetch(), [])

        const draw_list = []

        if (statusCode === 200 && finished && result != null) {
                result.forEach((user) => {
                        draw_list.push(
                                <EditUserRow user={user} key={user.id} refresh={triggerFetch}/>
                )
                })
        }

        const page_name = (
                <div>
                        <NavLink to="/admin/panel">
                                Admin Panel
                        </NavLink>
                        /user list
                </div>
        )

        return (
                <AdminWrapper>
                        <ContentWrapper page_name={page_name}>
                                {draw_list}
                                <AddUser refresh={triggerFetch}/>
                        </ContentWrapper>
                </AdminWrapper>
        )
}

export default AdminUserList
import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import {createContext, useContext, useEffect, useState} from "react";

export const SnackbarContext = createContext()

export default function SnackbarAlert() {
    const {newMessageSnackbar} = useContext(SnackbarContext)

    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (newMessageSnackbar !== "") {
            setOpen(true)
            setMessage(newMessageSnackbar)
        }

    }, [newMessageSnackbar]);

    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={() => setOpen(false)}
            message={message}
        />
    );
}


export function SnackbarContextProvider({children}) {
    const [openSnackbar, setOpenSnackbar] = useState(false)
    const [messageSnackbar, setMessageSnackbar] = useState("")
    const [newMessageSnackbar, setNewMessageSnackbar] = useState("")

    return (
        <SnackbarContext.Provider value = {{openSnackbar, setOpenSnackbar, messageSnackbar, setMessageSnackbar, newMessageSnackbar, setNewMessageSnackbar}}>
            <SnackbarAlert/>
            {children}
        </SnackbarContext.Provider>
    );
}
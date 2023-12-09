import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import {createContext, useState} from "react";

export const SnackbarContext = createContext()

export default function SnackbarAlert({label, shouldShow, closeSelf}) {
    return (
        <Snackbar
            open={shouldShow}
            autoHideDuration={6000}
            onClose={closeSelf}
            message={label}
        />
    );
}


export function SnackbarContextProvider({children}) {
    const [openSnackbar, setOpenSnackbar] = useState(false)
    const [messageSnackbar, setMessageSnackbar] = useState("")

    return (
        <SnackbarContext.Provider value = {{openSnackbar, setOpenSnackbar, messageSnackbar, setMessageSnackbar}}>
            {children}
        </SnackbarContext.Provider>
    );
}
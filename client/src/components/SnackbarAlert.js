import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';

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

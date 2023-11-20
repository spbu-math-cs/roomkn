import './Content.css'
import {Box, CardContent, CardHeader, Paper, Stack} from "@mui/material";

function ContentWrapper({children, page_name, orientation}) {
    return (
        <Box sx={{padding: "10pt"}}>
            <Paper elevation={10} orientation={orientation}>
                <CardHeader titleTypographyProps={{variant: "h4", color: "secondary"}} title={page_name}/>
                <CardContent>
                    <Stack>
                        {children}
                    </Stack>
                </CardContent>
            </Paper>
        </Box>
    )
}

export default ContentWrapper
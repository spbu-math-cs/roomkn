import React from "react";
import ContentWrapper from "../components/Content";

import "./About.css"
import {Box, Grid, Link, List, ListItem, Stack, Typography} from "@mui/material";

const Sprint = ({sprint_name, children, color="secondary"}) => {
    return (
        <Grid item xs={4}>
            <Box>
                <Typography color={color}>
                    {sprint_name}
                </Typography>

                {children}
            </Box>
        </Grid>
    )
}

const About = () => {
    return (
        <ContentWrapper page_name="About project">
            <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }} sx={{paddingLeft: 4, paddingRight:4 }}>
                <Grid item xs={8}>
                    <Stack spacing={1}>
                        <Box>
                            ROOMKN is a classroom booking service for educational institutions or companies
                        </Box>

                        <Box>
                            In our service users use map and can book rooms
                        </Box>

                        <Box>
                            Also our service provide administration instruments like admin panel, admin can edit map/rooms/users/reservations
                        </Box>

                        <Box>
                        Our project is open-source, github repository is <Link href={"https://github.com/spbu-math-cs/roomkn"}>here</Link>
                        </Box>

                    </Stack>
                </Grid>
                <Grid item xs={4} sx={{mb: 2}}>
                    <Box>
                        <Typography variant="h4" color={"secondary"}>
                            Developers
                        </Typography>
                        <List>
                            <ListItem>
                                <Link href={"https://github.com/darkfaeries"}>
                                    Ivan Shinkevich
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link href={"https://github.com/firelion9"}>
                                    Leonid Ternopol
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link href={"https://github.com/makselivanov"}>
                                    Makar Selivanov
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link href={"https://github.com/Bupaheh"}>
                                    Pavel Balay
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link href={"https://github.com/PaulRalnikov"}>
                                    Pavel Ralnikov
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link href={"https://github.com/robozmey"}>
                                    Vladimir Rachkin
                                </Link>
                            </ListItem>
                        </List>
                    </Box>
                </Grid>
                <Sprint sprint_name={"First Sprint"}>
                    We made first version of design
                </Sprint>
                <Sprint sprint_name={"Second Sprint"}>
                    RooMKN gained basic functionality: getting room list, getting room information, reserving room
                </Sprint>
                <Sprint sprint_name={"Third Sprint"}>
                    We added authorisation, only registered users can reserve
                </Sprint>
                <Sprint sprint_name={"Fourth Sprint"}>
                    We added admin panel
                </Sprint>
                <Sprint sprint_name={"Fifth Sprint"}>
                    We added user profile and user reservations pages
                </Sprint>
                <Sprint sprint_name={"Sixth Sprint"}>
                    We added map
                </Sprint>
                <Sprint sprint_name={"Seventh Sprint"}>
                    We added registration links

                    We adapted web design for mobile

                    RooMKN is now available on <Link href="https://roomkn.kpnn.ru">https://roomkn.kpnn.ru</Link>
                </Sprint>
            </Grid>
        </ContentWrapper>
    );
};
 
export default About;
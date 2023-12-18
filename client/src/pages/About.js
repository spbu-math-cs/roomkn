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
                            RooMKN is a classroom booking service for educational institutions or companies
                        </Box>

                        <Box>
                            Our service provides ability instantly book a room or view rooms on a map
                        </Box>

                        <Box>
                            Our service also provide administration tools using which admins can edit the map, rooms, reservations and users info
                        </Box>

                        <Box>
                            Our project is open-source and licensed under terms of the Apache License 2.0. Its source can be found on <Link href={"https://github.com/spbu-math-cs/roomkn"} data-test-id="external-link">github</Link>
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
                                <Link href={"https://github.com/darkfaeries"} data-test-id="external-link">
                                    Ivan Shinkevich
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link href={"https://github.com/firelion9"} data-test-id="external-link">
                                    Leonid Ternopol
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link href={"https://github.com/makselivanov"} data-test-id="external-link">
                                    Makar Selivanov
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link href={"https://github.com/Bupaheh"} data-test-id="external-link">
                                    Pavel Balay
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link href={"https://github.com/PaulRalnikov"} data-test-id="external-link">
                                    Pavel Ralnikov
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link href={"https://github.com/robozmey"} data-test-id="external-link">
                                    Vladimir Rachkin
                                </Link>
                            </ListItem>
                        </List>
                    </Box>
                </Grid>
                <Sprint sprint_name={"First Sprint"}>
                    We made the first version of the app
                </Sprint>
                <Sprint sprint_name={"Second Sprint"}>
                    RooMKN gained basic functionality such as retrieving room list and room information and room booking
                </Sprint>
                <Sprint sprint_name={"Third Sprint"}>
                    We added authorisation, starting from that sprint, only registered users can book rooms
                </Sprint>
                <Sprint sprint_name={"Fourth Sprint"}>
                    We added admin panel and user profile page
                </Sprint>
                <Sprint sprint_name={"Fifth Sprint"}>
                    We added user reservations pages and reworked the design
                </Sprint>
                <Sprint sprint_name={"Sixth Sprint"}>
                    We added map
                </Sprint>
                <Sprint sprint_name={"Seventh Sprint"}>
                    We added registration links

                    We adapted web design for mobile devices

                    RooMKN is now available on <Link href="https://roomkn.kpnn.ru">https://roomkn.kpnn.ru</Link>
                </Sprint>
            </Grid>
        </ContentWrapper>
    );
};
 
export default About;
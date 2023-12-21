import React from "react";
import {fromAPITime, toAPITime} from "../api/API";
import Timeline from "../components/TimelineForRoomList";
import {GetReservations, GetRoomInfo, getTodayDate} from "./Room";
import {Box, Typography, Stack} from "@mui/material";

export function RoomScreenPage() {
    const date_string = getTodayDate()
    const [date, setDate] = React.useState(date_string)
    const room_info = GetRoomInfo()
    const {reservations, triggerGetReservations} = GetReservations(room_info.id, date)
    const fromTimelineDate = new Date(toAPITime(date, "09:30"))
    const untilTimelineDate = new Date(toAPITime(date, "23:59"))

    console.log(reservations)

    const page_name = "Classroom: " + room_info.name

    const currentTime = "12:35";

    const currentDate = "Today - " + getTodayDate("dd.mm.yyyy");

    const is_free_now = false;

    const next_reservation = reservations ? reservations[1] : null;

    // const res_from = fromAPITime(next_reservation.from)
    // const res_until = fromAPITime(next_reservation.until)



    const available_label = next_reservation == null ? "Available until yesterday" : "Available until " + fromAPITime(next_reservation.from).time
    const meeting_label =  next_reservation == null ? "Meeting in progress" : "Meeting until " + fromAPITime(next_reservation.until).time

    const footnote_color = is_free_now ? "success.main" : "warning.main"
    const foot_note_text = is_free_now ? available_label : meeting_label

    return (
        <Box sx={{position: "absolute", top: 0, height: 100 / 100, width: 100 / 100, bgcolor: "black"}}>
            <Box sx={{width: 100/100, height: 40/100}}>
                <Box sx={{padding:6}}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="h2">
                                {page_name}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h4">
                                {room_info.description}
                            </Typography>
                        </Box>

                    </Stack>
                </Box>
                <Typography variant="h2" sx={{position: "absolute", top: 10, right: 20}}>
                    {currentTime}
                </Typography>
            </Box>
            <Stack
                justifyContent="center"
                alignItems="center"
                spacing={12}
                sx={{mx: 5/100}}
            >
                <Box sx={{width: 80/100, padding: 5}}>
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        spacing={4}
                        sx={{height: 100/100}}
                    >
                        <Typography variant="h2">
                            {currentDate}
                        </Typography>
                        <Timeline reservations={reservations}
                                  fromTimelineDate={fromTimelineDate}
                                  untilTimelineDate={untilTimelineDate}
                                  // show_reservation_labels={true}
                                  show_time_labels={true}
                                  height={150}
                        />
                    </Stack>
                </Box>
            </Stack>
            <Stack
                justifyContent="center"
                alignItems="flex-start"
                sx={{position: "absolute", bottom: 0, width: 100/100, height: 8/100, bgcolor: footnote_color}}
            >
                <Typography variant="h4" sx={{alignText: "left", ml: 5}}>
                    {foot_note_text}
                </Typography>
            </Stack>
        </Box>
    )
}

export default RoomScreenPage;
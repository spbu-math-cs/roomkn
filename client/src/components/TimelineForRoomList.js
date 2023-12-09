import {fromAPITime} from '../api/API';
import "./TimelineForRoomList.css"

const StartDayHours = 9
const StartDayMinutes = 0
const FinishDayHours = 23
const FinishDayMinutes = 59

function Reservation({reservation, fromTimelineDate, untilTimelineDate}) {
    const fromReservationObj = fromAPITime(reservation.from)
    const untilReservationObj = fromAPITime(reservation.until)

    const fromReservationDate = new Date(fromReservationObj.date + " " + fromReservationObj.time)
    const untilReservationDate = new Date(untilReservationObj.date + " " + untilReservationObj.time)

    const fromTimelineTime = fromTimelineDate.getTime()
    const untilTimelineTime = untilTimelineDate.getTime()
    const fromReservationTime = fromReservationDate.getTime()
    const untilReservationTime = untilReservationDate.getTime()

    const realReservationFromTime = (fromReservationTime >= fromTimelineTime ? fromReservationTime : fromTimelineTime)
    const realReservationUntilTime = (untilReservationTime <= untilTimelineTime ? untilReservationTime : untilTimelineTime)

    const durationReservationsSeconds = (realReservationUntilTime - realReservationFromTime) / 1000
    const startReservationSeconds = (realReservationFromTime - fromTimelineTime) / 1000
    const timelineDurationSeconds = (untilTimelineTime - fromTimelineTime) / 1000

    const leftOffset = (startReservationSeconds / timelineDurationSeconds * 100) + "%"
    const reservationWidth = (durationReservationsSeconds / timelineDurationSeconds * 100) + "%"

    const row_style = {
        top: 0,
        left: leftOffset,
        width: reservationWidth,
        height: "100px"
    }

    return (
        <div className="reservation-row" style={row_style}>
            <div className="reservation-wrapper">
                <div className="reservation-info"/>
            </div>
        </div>
    )
}

function TimelineForRoomList({reservations, fromTimelineDate = null, untilTimelineDate = null}) {
    if (reservations == null) return (
        <label className='reservations-not-found-label'>
            Не удалось получить список бронирований для этого кабинета.
        </label>
    )

    if (fromTimelineDate == null) {
        fromTimelineDate = new Date()
        fromTimelineDate.setHours(StartDayHours, StartDayMinutes)
    }
    
    if (untilTimelineDate == null) {
        untilTimelineDate = new Date()
        untilTimelineDate.setHours(FinishDayHours, FinishDayMinutes)
    }

    console.log("reservations: " + reservations)

    const reservationsList = []
    reservations.forEach((reservation) => {
        reservationsList.push(
            <Reservation
                reservation={reservation}
                fromTimelineDate={fromTimelineDate}
                untilTimelineDate={untilTimelineDate}
            />
        )
    })

    return (
        <div className="reservation-list-wrapper">
            <div className="reservation-list-background"/>
            {reservationsList}
        </div>
    )
}

export default TimelineForRoomList
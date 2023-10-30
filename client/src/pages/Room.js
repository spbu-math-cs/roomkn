import {Link, NavLink, useLocation, useNavigate} from 'react-router-dom'

import './Room.css'
import ContentWrapper from '../components/Content';
import React, {createContext, useContext, useEffect, useState} from 'react';
import useAPI, {toAPITime, fromAPITime} from '../api/API';
import useSomeAPI from '../api/FakeAPI';
import {CurrentUserContext, IsAuthorizedContext} from "../components/Auth";
// import Form from '../components/Form'

const CurrentReservationContext = createContext()

function GetRoomInfo() {
  const location = useLocation();
  const navigate = useNavigate()

  const id = location.pathname.slice(6, location.pathname.length)

  let {triggerFetch, result, loading, statusCode} = useSomeAPI('/api/v0/rooms/' + id)

    useEffect(() => triggerFetch(), [])

    // doRequest()
    if (statusCode === 404) {
        navigate('/pagenotfound', {replace: true})

    }
  if (statusCode !== 200 || loading || result == null) {
    return {
      id: id
    }
  }

  // const res = getRoomInfo(id)

  return result
}

function GetReservations(room_id, date) {
  console.log("GetReservations invoked with date = " + date)
  console.log("used some api with /api/v0/rooms/" + room_id + "/reservations")
  let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/rooms/' + room_id + '/reservations')
    useEffect(() => triggerFetch(), [])
    console.log("after useSomeAPI")

    if (statusCode === 200 && finished && result != null) {
      return {
          reservations: result.filter((reservation) => (fromAPITime(reservation.from).date === date)),
          triggerGetReservations: triggerFetch
      }
    }
  
  return {
      reservations: null,
      triggerGetReservations: triggerFetch
  }
}

function useBookRoom(room_id, user_id, date, from, to) {
    const {currentUser} = useContext(CurrentUserContext)

  const reservation = {
    user_id: user_id,
    from: toAPITime(date, from),
    until: toAPITime(date, to),
    room_id: room_id
  }

  let {triggerFetch, result, loading, statusCode, finished} = useSomeAPI('/api/v0/reserve', reservation, "POST")

  return {triggerFetch, result, loading, statusCode, finished}
}


function BookingForm({room_id, triggerGetReservations}) {

  const {from, setFrom, until, setUntil, date} = useContext(CurrentReservationContext)

  const {currentUser} = useContext(CurrentUserContext)
  const {triggerFetch, result, statusCode, finished} = useBookRoom(room_id, currentUser?.user_id, date, from, until);

  useEffect(() => {
    if (finished) {
        if (statusCode === 400) alert("Ошибка: " + result)
        else if (statusCode === 409) alert("Невозможно выполнить бронирование: в это время комната занята")
        else if (statusCode === 201) alert("Бронирование успешно!");
        else alert("Status Code: " + statusCode)

        triggerGetReservations()
    }
}, [finished]);

  if (currentUser === null) {
    return (
      <ContentWrapper page_name='Форма бронирования'>
        <label className='not-authorized-label'>
          Вы не авторизованы в системе. Чтобы получить возможность бронирования, пожалуйста,
        </label>
        <NavLink className='not-authorized-link' to='/sign-in'>
          войдите в систему.
        </NavLink>
      </ContentWrapper>
    )
  }

  // useEffect(() => {
  //     setName(currentUser?.user_id)
  // }, [])




  const HandleSubmit = (e) => {
    e.preventDefault();

    triggerFetch()
      triggerGetReservations()
  };

  return (
    <ContentWrapper page_name='Форма бронирования'>
      <form className="form-wrapper" onSubmit={HandleSubmit}>
          <div className="form-field">
              <label className="form-label">
                  С
              </label>
              <input className="form-input" type="time" value={from} onChange={(e) => setFrom(e.target.value)}>
                  
              </input>
          </div>
          <div className="form-field">
              <label className="form-label">
                  До
              </label>
              <input className="form-input" type="time" value={until} onChange={(e) => setUntil(e.target.value)}>
                  
              </input>
          </div>
          <input className="form-submit" type="submit" value="Забронировать"></input>
      </form>
    </ContentWrapper>
  )
}

function Reservation ({reservation, is_current_reservation=false}) {

  let {triggerFetch, result, loading, statusCode} = useSomeAPI('/api/v0/users/' + reservation.user_id)

  useEffect(() => triggerFetch(), [reservation])

  var reservedUsername = result?.username

    if (reservedUsername == null) {
        reservedUsername = reservation.user_id
    }

  const from_obj = fromAPITime(reservation.from)
  const until_obj = fromAPITime(reservation.until)

  const from_date = new Date(from_obj.date + " " + from_obj.time)
  const until_date = new Date(until_obj.date + " " + until_obj.time)
  const day_start_date = new Date(until_obj.date + " " + "09:00")

  const duration_in_seconds = (until_date.getTime() - from_date.getTime()) / 1000
  const from_start_in_seconds = (from_date.getTime() - day_start_date.getTime()) / 1000
  const day_duration_in_seconds = 14 * 60 * 60

  const left_offset = (from_start_in_seconds / day_duration_in_seconds * 100) + "%"
  const reservation_width = (duration_in_seconds / day_duration_in_seconds * 100) + "%"

  const row_style = {
      top: 0,
      left: left_offset,
      width: reservation_width,
      height: "100px"
  }

  var reservation_class_name = "reservation-wrapper"
  if (is_current_reservation) {
      reservation_class_name = "reservation-current-wrapper"
  }

  return (
    <div className="reservation-row" style={row_style}>
      <div className={reservation_class_name}>
          <div className="reservation-info">
              <div className="reservation-time">
                  <label className='reservation-time-label'>
                      {fromAPITime(reservation.from).time} - {fromAPITime(reservation.until).time}
                  </label>
              </div>
              <div className="reservation-user">
                  <label className='reservation-user-label'>
                      {reservedUsername}
                  </label>
              </div>
          </div>
      </div>
    </div>
  )
}

function ReservationsList({reservations}) {
  const {user_id} = useContext(CurrentUserContext)
  const {isAuthorized} = useContext(IsAuthorizedContext)
  const {from, until, date} = useContext(CurrentReservationContext)

  if (reservations == null) return (
    <label className='reservations-not-found-label'>
      Не удалось получить список бронирований для этого кабинета.
    </label>
  )

  console.log("reservations: " + reservations)


  const reservationsList = []
  reservations.forEach((reservation) => {
      reservationsList.push (
          // <li>
            <Reservation reservation={reservation}/>
          // </li>
        )
    })

  if (isAuthorized) {
    const current_reservation = {
      from: toAPITime(date, from),
      until: toAPITime(date, until),
      user_id: user_id
    }
    reservationsList.push(<Reservation reservation={current_reservation} is_current_reservation={true}></Reservation>)
  }


  return (
      <div className="reservation-list-wrapper">
          <div className="reservation-list-background"/>
          {reservationsList}
      </div>
  )
}

function dateFormat(date, format = "yyyy-mm-dd") {
    var mlz = ""
    if (date.getMonth() + 1 < 10) mlz = "0"
    var dlz = ""
    if (date.getDate() < 10) dlz = "0"
    const map = {
        mm: mlz + (date.getMonth() + 1),
        dd: dlz + date.getDate(),
        yyyy: date.getFullYear(),
        // yy: date.getFullYear().toString().slice(-2)
    }

    return format.replace(/mm|dd|yyyy/gi, matched => map[matched])
}

function getTodayDate(format = "yyyy-mm-dd") {
    const date = new Date()

    return dateFormat(date, format)
}

function updateDate(date, diff) {
    const new_date = new Date(date)
    new_date.setDate(new_date.getDate() + diff)
    const tmp = dateFormat(new_date)
    console.log(tmp)
    return tmp
}

function RoomDate({date, setDate}) {

    return (
        <div className="form-field">
            <label className="form-label">
                Дата
            </label>
            <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="button" value="<" onClick={() => setDate(updateDate(date, -1))}/>
            <input type="button" value=">" onClick={() => setDate(updateDate(date, +1))}/>
        </div>
    )
}

function Room() {
  const date_string = getTodayDate()
  const [date, setDate] = React.useState(date_string)
  const [from, setFrom] = React.useState("09:30")
  const [until, setUntil] = React.useState("11:05")
  const room_info = GetRoomInfo()
  const {reservations, triggerGetReservations} = GetReservations(room_info.id, date)

  console.log(reservations)

  const page_name = "Аудитория " + room_info.name

  return (
    <ContentWrapper page_name={page_name}>
        <CurrentReservationContext.Provider value={{date, setDate, from, setFrom, until, setUntil}}>
            <div className="room-wrapper">
                <div className='room-info'>
                    <div className='room-description'>{room_info.description}</div>
                     <div className='room-date'>
                        <RoomDate date={date} setDate={setDate}/>
                    </div>
                    <div className='reservations-info'>
                        <div>
                            <label className='reservations-label'>Бронирования на {date}:</label>
                        </div>
                        <ReservationsList reservations={reservations}></ReservationsList>
                    </div>
                </div>
                <div className='room-booking-form'>
                    <BookingForm room_id={room_info.id} date={date} triggerGetReservations={triggerGetReservations}/>
                </div>
            </div>
        </CurrentReservationContext.Provider>
    </ContentWrapper>
  );
}

export default Room;

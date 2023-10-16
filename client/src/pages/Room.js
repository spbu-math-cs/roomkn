import {useLocation, useNavigate} from 'react-router-dom'

import './Room.css'
import ContentWrapper from '../components/Content';
import React, {useContext, useEffect, useState} from 'react';
import useAPI, {toAPITime, fromAPITime} from '../api/API';
import useSomeAPI from '../api/FakeAPI';
import {CurrentUserContext} from "../components/Auth";
// import Form from '../components/Form'

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
  if (statusCode !== 200 || loading) {
    return {
      id: id,
      name: "Unknown cabinet",
      description: "Status code: " + statusCode,
      reservations: "Result: " + result
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

    if (statusCode === 200 && finished) {
      // const reservation_list = []
      // result.forEach((reservation) => {
      //   if (fromAPITime(reservation.from) === date) reservation_list.push(reservation)
      // });
      return result.filter((reservation) => (fromAPITime(reservation.from).date === date))
    }
  
  return null
}

function useBookRoom(room_id, user_id, date, from, to) {

  // TODO instant from date and from

  const reservation = {
    user_id: 1,
    from: toAPITime(date, from),
    until: toAPITime(date, to),
    room_id: room_id
  }

  let {triggerFetch, result, loading, statusCode, finished} = useSomeAPI('/api/v0/reserve', reservation, "POST")

  return {triggerFetch, result, loading, statusCode, finished}
}

function BookingForm({room_id, date}) {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('09:30');
  const [to,   setTo]   = useState('11:05');

  const {triggerFetch, result, statusCode, finished} = useBookRoom(room_id, name, date, from, to);

  const {currentUser} = useContext(CurrentUserContext)
  useEffect(() => {
      setName(currentUser?.user_id)
  }, [])


    useEffect(() => {
        if (finished) {
            if (statusCode === 400) alert("Ошибка: " + result)
            else if (statusCode === 409) alert("Невозможно выполнить бронирование: в это время комната занята")
            else if (statusCode === 201) alert("Бронирование успешно!");
            else alert("Status Code: " + statusCode)
        }
    }, [finished]);


  const HandleSubmit = (e) => {
    e.preventDefault();

    triggerFetch()

    // console.log(name, date, from, to, statusCode, finished)


  };

  return (
      <form className="form-wrapper" onSubmit={HandleSubmit}>
          <div className="form-name">
              Форма бронирования
          </div>
          <div className="form-field">
              <label className="form-label">
                  Имя
              </label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)}>
                  
              </input>
          </div>
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
              <input className="form-input" type="time" value={to} onChange={(e) => setTo(e.target.value)}>
                  
              </input>
          </div>
          <input className="form-submit" type="submit" value="Забронировать"></input>
      </form>
  )
}

const Reservation = (reservation) => {

  let {triggerFetch, result, loading, statusCode} = useSomeAPI('/api/v0/users/' + reservation.user_id)

  useEffect(() => triggerFetch(), [])

  const reservedUsername = result?.username

  return (
    <div className="reservation-row">
      <div className="reservation-time">
        <label className='reservation-time-label'>
          {fromAPITime(reservation.from).time} - {fromAPITime(reservation.until).time}
        </label>
      </div>
      <div className="reservation-user">
        <label className='reservation-user-label'>
          Забронировано {reservedUsername}.
        </label>
      </div>
    </div>
  )
}

function ReservationsList({reservations}) {
  if (reservations == null) return (
    <label className='reservations-not-found-label'>
      Не удалось получить список бронирований для этого кабинета.
    </label>
  )

  console.log("reservations: " + reservations)

  const reservationsList = reservations.map((reservation) => {
        return (
          <li>
            {Reservation(reservation)}
          </li>
        )
    })

  return (
      <ul>
          {reservationsList}
      </ul>
  )
}

function Room() {

  const [date, setDate] = React.useState('2022-10-12')
  const room_info = GetRoomInfo()
  const reservations = GetReservations(room_info.id, date)

  console.log(reservations)

  const page_name = "Аудитория " + room_info.name

  return (
    <ContentWrapper page_name={page_name}>
      <div className="room-wrapper">
        <div className='room-info'>
          <div className='room-description'>{room_info.description}</div>
          <div className='room-books'>{room_info.reservations}</div>
          <div className="form-field">
              <label className="form-label">
                  Дата
              </label>
              <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)}>
                  
              </input>
          </div>
          <div className='reservations-info'>
            <div>
              <label className='reservations-label'>Бронирования на {date}:</label>
            </div>
            <ReservationsList reservations={reservations}></ReservationsList>
          </div>
        </div>
        <div className='room-booking-form'>
          <BookingForm room_id={room_info.id} date={date}/>
        </div>
      </div>
    </ContentWrapper>
  );
}

export default Room;
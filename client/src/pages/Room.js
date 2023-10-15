import {useLocation, useNavigate} from 'react-router-dom'

import './Room.css'
import ContentWrapper from '../components/Content';
import React, {useContext, useEffect, useState} from 'react';
import useAPI, {toAPITime} from '../api/API';
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
      name: "Unkonwn cabinet",
      description: "Status code: " + statusCode,
      reservations: "Result: " + result
    }
  }

  // const res = getRoomInfo(id)

  return result
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

function BookingForm({room_id}) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('2023-10-12');
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
                  Дата
              </label>
              <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)}>
                  
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


function Room() {

  const room_info = GetRoomInfo()

  const page_name = "Аудитория " + room_info.name

  return (
    <ContentWrapper page_name={page_name}>
      <div className="room-wrapper">
        <div className='room-info'>
          <div className='room-description'>{room_info.description}</div>
          <div className='room-books'>{room_info.reservations}</div>
        </div>
        <div className='room-booking-form'>
          <BookingForm room_id={room_info.id}/>
        </div>
      </div>
    </ContentWrapper>
  );
}

export default Room;
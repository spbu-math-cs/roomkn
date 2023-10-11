import { useLocation } from 'react-router-dom'

import './Room.css'
import ContentWrapper from '../components/Content';
import React from 'react';
import useAPI from '../api/API';
import callSomeAPI from '../api/FakeAPI';
// import Form from '../components/Form'

function GetRoomInfo() {
  const location = useLocation();

  const id = location.pathname.slice(6, location.pathname.length)

  let [result, loading, error] = useAPI('/api/v0/rooms/' + id)

  if (error || loading) {
    return {
      id: id,
      description: error,
      reservations: "sdssd"
    }
  }

  // const res = getRoomInfo(id)

  return result
}

function BookRoom(name, date, from, to) {
   //let bookResultPromise = bookRoom(name, date, from, to)

   //bookResultPromise.then((result) => {
   //  alert(result)
   //}).catch((e) => {
   //  alert(e.message)
   //})

  const location = useLocation();

  const id = location.pathname.slice(6, location.pathname.length)

  // TODO instant from date and from

  const reservation = {
    user_id: name,
    from: from,
    until: to,
    room_id: id
  }

  let [result, loading, error] = callSomeAPI('/api/v0/reserve', reservation, "POST")

  if (error === 400) alert("Ошибка: " + result)
  else if (error === 409) alert("Невозможно выполнить бронирование: в это время комната занята")
  else alert("Бронирование успешно!");
}

function Form() {
  const [name, setName] = React.useState('');
  const [date, setDate] = React.useState('2023-10-12');
  const [from, setFrom] = React.useState('09:30');
  const [to,   setTo]   = React.useState('11:05');

  // setDate("10.11.12")

  const handleSubmit = (e) => {
    e.preventDefault();
    BookRoom(name, date, from, to);
    console.log(name, date, from, to)
  };

  return (
      <form className="form-wrapper" onSubmit={handleSubmit}>
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

  const page_name = "Аудитория " + room_info.id

  return (
    <ContentWrapper page_name={page_name}>
      <div className="room-wrapper">
        <div className='room-info'>
          <div className='room-name'>{room_info.id}</div>
          <div className='room-description'>{room_info.description}</div>
          <div className='room-books'>{room_info.reservations}</div>
        </div>
        <div className='room-booking-form'>
          <Form/>
        </div>
      </div>
    </ContentWrapper>
  );
}

export default Room;
import { useLocation } from 'react-router-dom'

import './Room.css'
import ContentWrapper from '../components/Content';
import React from 'react';
import Api from '../api/Api';
// import Form from '../components/Form'

const api = new Api()

function GetRoomInfo() {
  const location = useLocation();

  const id = location.pathname.slice(6, location.pathname.length)

  const res = api.getRoomInfo(id)

  return {
    id: id,
    description: res.description,
    reservations: res.reservations
  }
}

function BookRoom(name, date, from, to) {
  let bookResultPromise = api.bookRoom(name, date, from, to)

  bookResultPromise.then((result) => {
    alert(result)
  }).catch((e) => {
    alert(e.message)
  })

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
          <div className='room-desciption'>{room_info.description}</div>
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
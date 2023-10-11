import { Link } from "react-router-dom"

import './List.css'
import ContentWrapper from "../components/Content"
import useAPI from "../api/API"
import callSomeAPI from "../api/FakeAPI"

function RoomRow(room) {

  const link = "/room/" + String(room.id)

  return (
    <div className="room-row">
      <div className="room-row-number">
        <Link to={link} className="room-row-link">
          {room.id}
        </Link>
      </div>
      <div className="room-row-desc">
        {room.description}
      </div>
    </div>
  )
}

function GetRoomList() {

  let [result, loading, error] = callSomeAPI('/api/v0/rooms/')

  return result
}

function List() {

  const rooms_list = GetRoomList()

  const draw_list = []

  if (rooms_list) {
    rooms_list.forEach((room) => {
      draw_list.push(RoomRow(room))
    })
  }

  return (
    <ContentWrapper page_name="Список аудиторий">
      <div className="room-list">
        {draw_list}
      </div>
    </ContentWrapper>
  );
}

export default List;
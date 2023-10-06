import { Link } from "react-router-dom"

import './List.css'
import ContentWrapper from "../components/Content"
import Api from "../api/Api"

const api = new Api()

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

  return api.getRoomList()

  return [
    {
      number: 102,
      description: "Аудитория 102 содержит проектор"
    },
    {
      number: 103,
      description: "В 103 аудитории доска - маркерная"
    }
  ]
}

function List() {

  const rooms_list = GetRoomList()

  const draw_list = []

  rooms_list.forEach((room) => {
    draw_list.push(RoomRow(room))
  })

  return (
    <ContentWrapper page_name="Список аудиторий">
      <div className="room-list">
        {draw_list}
      </div>
    </ContentWrapper>
  );
}

export default List;
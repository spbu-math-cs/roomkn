import { Link } from "react-router-dom"

import './List.css'
import ContentWrapper from "../components/Content"
import useAPI from "../api/API"
import useSomeAPI from "../api/FakeAPI"
import {useEffect} from "react";

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

function List() {

  let [fetchTrigger, result, loading, statusCode] = useSomeAPI('/api/v0/rooms/')

  useEffect(() => fetchTrigger(), [])

  const draw_list = []

  if (statusCode === 200 && !loading) {
      result.forEach((room) => {
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
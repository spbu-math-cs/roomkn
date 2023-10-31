import { Link } from "react-router-dom"

import './List.css'
import ContentWrapper from "../components/Content"
import useSomeAPI from "../api/FakeAPI"
import {useEffect} from "react";

function RoomRow({room}) {

  const link = "/room/" + String(room.id)

  return (
    <div className="room-row">
      <div className="room-row-number">
        <Link to={link} className="room-row-link">
          {room.name}
        </Link>
      </div>
      <div className="room-row-desc">
        {room.description}
      </div>
    </div>
  )
}

function List() {

  let {triggerFetch, result, finished, statusCode} = useSomeAPI('/api/v0/rooms')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => triggerFetch(), [])

  const draw_list = []

    if (statusCode === 200 && finished && result != null) {
        console.log(result)
        result.forEach((room) => {
            draw_list.push(<RoomRow room={room} key={room.id}/>)
        })
    }


  return (
    <ContentWrapper page_name="Classrooms">
      <div className="room-list">
        {draw_list}
      </div>
    </ContentWrapper>
  );
}

export default List;
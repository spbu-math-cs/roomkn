import { useLocation } from 'react-router-dom'

import './Room.css'
import ContentWrapper from '../components/Content';

function GetRoomInfo() {
  const location = useLocation();

  const number = location.pathname;
  const description = "auditory desc";

  return {
    number: number,
    description: description
  }
}

function Room() {

  const room_info = GetRoomInfo()

  const page_name = "Аудитория " + room_info.number

  return (
    <ContentWrapper page_name={page_name}>
      <div className="RoomContent">
        {room_info.number}
      </div>
    </ContentWrapper>
  );
}

export default Room;
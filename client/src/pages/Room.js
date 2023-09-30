import { useLocation } from 'react-router-dom'

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

  return (
    <div className="RoomContent">
        <p>
        {room_info.number}
        </p>
    </div>
  );
}

export default Room;
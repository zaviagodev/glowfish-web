import { useParams } from "react-router-dom"

const EventPage = () => {

  const { id } = useParams()

  return (
    <div>{id}</div>
  )
}

export default EventPage
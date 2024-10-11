import EventCard from "@/components/main/EventCard"
import EventSection from "@/components/main/EventSection"
import RegisterDrawer from "@/components/main/RegisterDrawer"
import { Button } from "@/components/ui/Button"
import { event_data } from "@/data/data"
import jameson from "@/img/jameson-live-music.svg"
import { RegisterDrawerProps } from "@/type/type"
import { Link } from "react-router-dom"

const WelcomeDrawer = ({
  isOpen,
  setIsOpen
} : RegisterDrawerProps) => {

    return (
    <RegisterDrawer isOpen={isOpen} setIsOpen={setIsOpen}>
      <h2 className="main-heading mt-[30px]">Welcome, this is where get people <span className="text-[#9B6CDE]">connected.</span></h2>

      <EventSection list={event_data} title="Upcoming Events"/>

      <footer className="btn-footer">
        <Button className="main-btn !bg-[#E58B4C]" onClick={() => setIsOpen(true)}>Let Glowfish</Button>
      </footer>
    </RegisterDrawer>
  )
}

export default WelcomeDrawer
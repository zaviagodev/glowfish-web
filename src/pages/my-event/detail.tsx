import Header from "@/components/main/Header"
import { event_data } from "@/data/data"
import { BookedDataCompProps, BookedDataProps } from "@/type/type"
import { useState } from "react"
import { useParams } from "react-router-dom"

const MyEventDetail = () => {
  const { id } = useParams()
  const [isQRCode, setIsQRCode] = useState(false)

  const BookedDataComp = ({ title, value } : BookedDataCompProps) => {
    return (
      <div className="space-y-1">
        <h3 className="text-[#5F5A5A] text-xs font-medium">{title}</h3>
        <p className="text-black page-title">{value}</p>
      </div>
    )
  }

  const customerData: BookedDataProps = {
    name: "John Persson",
    order_number: "CLD09738PL",
    date: "Nov 15 2024",
    time: "9:00 PM",
    gate: "1",
    seat: "West B"
  }

  const { name, order_number, date, time, gate, seat } = customerData

  return (
    <>
      <Header backButtonClassName="bg-white text-black rounded-sm h-8 w-8 flex items-center justify-center" title="My Event"/>

      {event_data.filter(data => data.id == id).map(data => (
        <section className="bg-white rounded-xl p-5 relative">
          {isQRCode ? null : <img src={data.image} className="rounded-sm"/>}
          <div className="border-b border-b-[#675E5E0D] space-y-2 pt-4 pb-5">
            <h3 className="text-black font-semibold text-lg leading-5">{data.title}</h3>
            <p className="text-[#5F5A5A] text-xs">{data.date} - {data.location}</p>
          </div>

          <div className="grid grid-cols-2 pt-5 gap-6">
            <BookedDataComp title="Name" value={name}/>
            <BookedDataComp title="Order Number" value={order_number}/>
            <BookedDataComp title="Date" value={date}/>
            <BookedDataComp title="Time" value={time}/>
            <BookedDataComp title="Gate" value={gate}/>
            <BookedDataComp title="Seat" value={seat}/>
          </div>

          <div className="relative h-full -bottom-5">
            <div className="bg-background h-9 w-9 absolute -left-10 rounded-full"/>
            {isQRCode ? null : <div className="border border-dashed border-[#675E5E80] relative top-[18px]"/>}
            <div className="bg-background h-9 w-9 absolute -right-10 rounded-full"/>
          </div>

          <div className="flex flex-col items-center relative pt-16">
            {/* TODO: Change to Barcode and QR Code */}
            {isQRCode ? 
              <h2 className="text-black">QR CODE</h2> 
            : <h2 className="text-black">BARCODE</h2>
            }
            <p className="text-black text-xs" onClick={() => setIsQRCode(!isQRCode)}>
              {isQRCode ? "Switch to Barcode" : "Switch to QR Code"}
            </p>
          </div>
        </section>
      ))}
    </>
  )
}

export default MyEventDetail
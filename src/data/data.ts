import { EventDataProps, RewardProps } from "@/type/type";

import jameson from "@/img/jameson-live-music.svg"
import paradise from "@/img/paradise-bangkok.svg"
import glowfishimg from "@/img/glowfishimg.svg"

export const event_data: EventDataProps[] = [
  {
    id: 1,
    image: jameson, 
    title: "Jameson Live Music | by Jameson Connects",
    location: "Glowfish, Sathon",
    date: "November 15, 2024",
    desc: "Join us for the delightful duet performances by Khun Waan & Khun Pop at ‘Jameson Live Music’ every Wednesday throughout March 2024! Meet Khun Wan @aloevocal , the sensational singer renowned for her stunning performances on The Voice Season 3 and Golden Song Thailand Season 3.",
    price: 0,
    validDate: "22 Dec 2024"
  },
  {
    id: 2,
    image: jameson, 
    title: "Jameson Live Music | by Jameson Connects test",
    location: "Glowfish, Sathon",
    date: "November 15, 2024",
    price: 0,
    validDate: "22 Dec 2024"
  },
]

export const event_you_might_enjoy: EventDataProps[] = [
  {
    id: 3,  
    image: paradise, 
    title: "THE PEOPLE CONCERT",
    location: "Glowfish, Sathon",
    date: "July 23, 2024",
    price: "free"
  },
  {
    id: 4,
    image: jameson, 
    title: "Music Afterwork ปลาชุมดึก",
    location: "Glowfish, Sathon",
    date: "Oct 29, 2024",
    price: "free"
  },
]

export const myRewardsList: RewardProps[] = [
  {
    id: 1,
    title: "50% discount for the next food purchases",
    validDate: "22 Dec 2024",
    desc: "สมาชิกหลักเท่านั้นที่มีสิทธิใช้คะแนนเพื่อแลกรับของรางวัล ขอสงวนสิทธิ์งดรับการแก้ไข เปลี่ยนแปลงใดหลังจากที่สมาชิกหลัก แจ้งความประสงค์ขอแลกคะแนนสะสมไปยังบริษัทฯแล้ว บริษัทฯ ขอแจ้งเปลี่ยนแปลงเงื่อนไขการแลกของรางวัล โดยมิได้แจ้ง ให้ทราบก่อนล่วงหน้า",
    category: "ของรางวัล",
    location: "Glowfish, Sathon",
    date: "July 23, 2024",
    points: 40,
    image: glowfishimg
  },
  {
    id: 2,
    title: "20% Discount for next event",
    validDate: "22 Dec 2024",
    desc: "สมาชิกหลักเท่านั้นที่มีสิทธิใช้คะแนนเพื่อแลกรับของรางวัล ขอสงวนสิทธิ์งดรับการแก้ไข เปลี่ยนแปลงใดหลังจากที่สมาชิกหลัก แจ้งความประสงค์ขอแลกคะแนนสะสมไปยังบริษัทฯแล้ว บริษัทฯ ขอแจ้งเปลี่ยนแปลงเงื่อนไขการแลกของรางวัล โดยมิได้แจ้ง ให้ทราบก่อนล่วงหน้า",
    category: "ของรางวัล",
    location: "Glowfish, Sathon",
    date: "July 23, 2024",
    points: 40,
    image: glowfishimg
  }
]
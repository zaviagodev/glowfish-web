import GlowfishIcon from "@/components/icons/GlowfishIcon";
import { Filter, Menu, Notification, Search } from "@/components/icons/MainIcons";
import Header from "@/components/main/Header";
import { useTranslate } from "@refinedev/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EventSection from "@/components/main/EventSection";
import { event_data, event_you_might_enjoy } from "@/data/data";
import { Link } from "react-router-dom";
import { getUserProfile } from "@/lib/auth";
import { useEffect, useState } from "react";

export const HomeList = () => {
  const t = useTranslate();
  const [userProfile, setUserProfile] = useState<{
    id: string;
    full_name: string;
    avatar_url: string;
  } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile();
      if (profile) {
        setUserProfile(profile);
      }
    };
    loadProfile();
  }, []);

  const buttonCates = [
    {
      title: 'Music Concert',
      color: '#FF5050'
    },
    {
      title: 'Exhibition',
      color: '#EE5736'
    },
    {
      title: 'Stand Up Show',
      color: '#006642'
    }
  ]

  return (
    <>
      <Header leftButton={<Menu className="text-white"/>} className="border-0" rightButton={<Notification />}/>
      <section>
        <div className="flex items-center justify-between px-5">
          <GlowfishIcon />
          <Link to="/rewards">
            <Avatar className="h-[50px] w-[50px]">
              <AvatarImage src={userProfile?.avatar_url || "https://github.com/shadcn.png"}/>
              <AvatarFallback>
                {userProfile?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
        <div className="relative flex items-center text-sm mt-4 px-5">
          <Search className="absolute left-8"/>
          <Input className="h-10 pl-10" placeholder={t("Search event..")}/>
          <Filter className="absolute right-8"/>
        </div>
        <section className="flex flex-col gap-10">
          <div className="flex items-center gap-3 mt-4 px-5 overflow-auto">
            {buttonCates.map(cate => (
              <Button key={cate.title} style={{backgroundColor: cate.color}}>{cate.title}</Button>
            ))}
          </div>
          <EventSection list={event_data} title={t("Upcoming Events")}/>
          <EventSection list={event_you_might_enjoy} title={t("Events you might enjoy")} cardType="small"/>
        </section>
      </section>
    </>
  );
};
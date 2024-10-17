import { CalendarIcon, Location } from "@/components/icons/MainIcons";
import Header from "@/components/main/Header";
import { event_data, event_you_might_enjoy } from "@/data/data";
import { useNavigation, useOne, useResource, useShow, useTranslate } from "@refinedev/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetOverlay,
  SheetTrigger,
} from "@/components/ui/sheet"
import GlowfishIcon from "@/components/icons/GlowfishIcon";
import { useState } from "react";
import DateGroup from "@/components/dateGroup/DateGroup";

export const HomeShow = () => {
  // const { edit, list } = useNavigation();
  // const { id } = useResource();
  // const { queryResult } = useShow({});
  // const { data } = queryResult;

  // const record = data?.data;

  // const { data: categoryData, isLoading: categoryIsLoading } = useOne({
  //   resource: "categories",
  //   id: record?.category?.id || "",
  //   queryOptions: {
  //     enabled: !!record,
  //   },
  // });

  const t = useTranslate();
  const { id } = useParams();
  const navigate = useNavigate()
  const [numOfParticipants, setNumOfParticipants] = useState(500)
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <>
      <Header className="bg-transparent border-0" />
      {(event_you_might_enjoy || event_data).filter(data => data.id == id).map(data => (
        <>
          <img src={data.image} className="w-full z-100"/>
          <section className="p-5 bg-background/80 relative -top-10 backdrop-blur-sm rounded-[14px] flex flex-col gap-7 mb-[120px]">
            <div className="flex flex-col gap-1.5">
              <h2 className="page-title">{data.title}</h2>
              <div className="flex items-center gap-2 text-xs">
                <Location />
                <p>{data.location}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CalendarIcon />
                <p>{data.date}</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex -space-x-3">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="https://github.com/shadcn.png"/>
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar className="h-7 w-7">
                  <AvatarImage src="https://github.com/shadcn.png"/>
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar className="h-7 w-7">
                  <AvatarImage src="https://github.com/shadcn.png"/>
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
              <h2 className="page-title">{t("participant", {count: numOfParticipants})}</h2>
            </div>
            {data.desc ? (
              <div className="flex flex-col gap-1.5">
                <h2 className="font-medium text-sm">{t("Description")}</h2>
                <p className="text-xs">{data.desc}</p>
              </div>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <h2 className="font-medium text-sm">{t("Venue & Location")}</h2>
              <p className="text-xs">{data.desc}</p>
            </div>
          </section>
          <footer className="btn-footer flex flex-col gap-7">
            <div className="space-y-1">
              <p className="text-xs">{t("Start from")}</p>
              <h2 className="font-sfpro-rounded font-semibold">{data.price}</h2>
            </div>
            <Sheet open={isConfirming} onOpenChange={setIsConfirming}>
              <SheetOverlay className="backdrop-blur-sm bg-transparent"/>
              <SheetTrigger className="main-btn !bg-[#EE5736]">{t("Sign up")}</SheetTrigger>
              <SheetContent className="h-[60%] !p-0 border-0 outline-none bg-background rounded-t-2xl p-5 flex flex-col" side="bottom">
                <section>
                  <header className="flex justify-between p-5 border-b border-b-header">
                    <GlowfishIcon />
                    <span 
                      className="font-semibold bg-[#FFFFFF1F] rounded-full h-[30px] w-[30px] font-sfpro-rounded flex items-center justify-center"
                      onClick={() => setIsConfirming(false)}
                    >
                      ✕
                    </span>
                  </header>
                  <main className="p-5 space-y-1">
                    <h2 className="font-semibold">{t("Select time")}</h2>
                    <DateGroup onSubmit={() => navigate('/checkout')}/>
                  </main>
                </section>
                <footer className="space-y-2 px-5 py-10">
                  <div className="text-center">
                    <p className="text-sm">{t("Total cost")}</p>
                    <h2 className="text-2xl font-sfpro-rounded font-medium">{data.price}</h2>
                  </div>
                </footer>
              </SheetContent>
            </Sheet>
          </footer>
        </>
      ))}
      {/* <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1>{"Show"}</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => list("blog_posts")}>{"List"}</button>
          <button onClick={() => edit("blog_posts", id ?? "")}>{"Edit"}</button>
        </div>
      </div>
      <div>
        <div style={{ marginTop: "6px" }}>
          <h5>{"ID"}</h5>
          <div>{record?.id ?? ""}</div>
        </div>
        <div style={{ marginTop: "6px" }}>
          <h5>{"Title"}</h5>
          <div>{record?.title}</div>
        </div>
        <div style={{ marginTop: "6px" }}>
          <h5>{"Content"}</h5>
          <p>{record?.content}</p>
        </div>
        <div style={{ marginTop: "6px" }}>
          <h5>{"Category"}</h5>
          <div>
            {categoryIsLoading ? (
              <>Loading...</>
            ) : (
              <>{categoryData?.data?.title}</>
            )}
          </div>
        </div>
        <div style={{ marginTop: "6px" }}>
          <h5>{"Status"}</h5>
          <div>{record?.status}</div>
        </div>
        <div style={{ marginTop: "6px" }}>
          <h5>{"Created at"}</h5>
          <div>
            {new Date(record?.createdAt).toLocaleString(undefined, {
              timeZone: "UTC",
            })}
          </div>
        </div>
      </div> */}
    </>
  );
};

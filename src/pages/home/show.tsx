import { Calendar, Location } from "@/components/icons/MainIcons";
import Header from "@/components/main/Header";
import { event_data, event_you_might_enjoy } from "@/data/data";
import { useNavigation, useOne, useResource, useShow } from "@refinedev/core";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import GlowfishIcon from "@/components/icons/GlowfishIcon";

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

  const { id } = useParams()

  return (
    <>
      <Header className="bg-transparent border-0" navigateBackTo={-1}/>

      {(event_you_might_enjoy || event_data).filter(data => data.id == id).map(data => (
        <>
          <img src={data.image} className="w-full z-100"/>

          <section className="p-5 bg-background/80 relative -top-10 backdrop-blur-sm rounded-[14px] flex flex-col gap-7 mb-[120px]">

            <div className="flex flex-col gap-1.5">
              <h2 className="font-semibold text-sm">{data.title}</h2>
              <div className="flex items-center gap-2 text-xs">
                <Location />
                <p>{data.location}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Calendar />
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

              <h2 className="font-semibold text-sm">50K+ Participants</h2>
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="font-medium text-sm">Description</h2>
              <p className="text-xs">{data.desc}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="font-medium text-sm">Venue & Location</h2>
              <p className="text-xs">{data.desc}</p>
            </div>
          </section>

          <footer className="btn-footer flex flex-col gap-7">
            <div className="space-y-1">
              <p className="text-xs">Start from</p>
              <h2 className="font-sfpro-rounded font-semibold">{data.price}</h2>
            </div>
            

            <Sheet>
              <SheetTrigger className="main-btn !bg-[#EE5736]">Sign up</SheetTrigger>
              <SheetContent className="h-[60%] p-0 border-0 outline-none bg-background rounded-t-2xl p-5 flex flex-col justify-between" side="bottom">
                <div className="flex justify-between">
                  <GlowfishIcon />
                </div>
                
                <footer className="space-y-2">
                  <div className="text-center">
                    <p className="text-sm">Total cost</p>
                    <h2 className="text-2xl font-sfpro-rounded font-medium">{data.price}</h2>
                  </div>
                  <Button className="main-btn !bg-[#F4DC53] text-black">Confirm booking</Button>
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

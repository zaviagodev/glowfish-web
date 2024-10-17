import { CardIcon, SettingsIcon, ShowPin, SpeedIcon, UnlockIcon } from "@/components/icons/MainIcons"
import Header from "@/components/main/Header"
import { useTranslate } from "@refinedev/core"
import { ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

const SettingsPage = () => {
  const t = useTranslate();
  const navigate = useNavigate();
  const menus = [
    {
      title: t("Profiles"),
      icon: <SettingsIcon />,
      link: ""
    },
    {
      title: t("Show PIN"),
      icon: <ShowPin />,
      link: ""
    },
    {
      title: t("How to Get Points"),
      icon: <UnlockIcon />,
      link: ""
    },
    {
      title: t("How to Spend Point"),
      icon: <CardIcon />,
      link: ""
    },
    {
      title: t("Member Level"),
      icon: <SpeedIcon />,
      link: ""
    }
  ];

  return (
    <>
      <Header title={t("Settings")} rightButton={t("Detail")}/>
      <section>
        <h2 className="font-semibold text-[28px]">{t("Manage")}</h2>
        <section className="flex flex-col gap-4 mt-10">
        {menus.map(menu => (
          <button onClick={() => navigate(menu.link)} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              <span className="h-9 w-9 flex items-center justify-center text-white rounded-full border border-[#252525]">{menu.icon}</span>
              <span className="page-title">{menu.title}</span>
            </div>
            <ChevronRight />
          </button>
        ))}
        </section>
      </section>
    </>
  )
}

export default SettingsPage
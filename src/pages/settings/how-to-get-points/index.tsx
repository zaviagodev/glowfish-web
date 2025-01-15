import Header from "@/components/main/Header";
import { useTranslate } from "@refinedev/core";
import { ArrowDown, ArrowUp } from "@/components/icons/MainIcons";

const HowToGetPoints = () => {
  const t = useTranslate();

  const pointRules = [
    {
      type: "earn",
      title: "Earn Points",
      description: "฿1 = 1 Point",
      icon: <ArrowDown className="text-[#4EA65B]" />
    },
    {
      type: "spend",
      title: "Spend Points",
      description: "100 Points = ฿10",
      icon: <ArrowUp className="text-[#EE3636]" />
    }
  ];

  const earnMethods = [
    {
      title: "Make a Purchase",
      points: "1 point per ฿1 spent"
    },
    {
      title: "First Purchase Bonus",
      points: "100 bonus points"
    },
    {
      title: "Birthday Bonus",
      points: "200 bonus points"
    },
    {
      title: "Review a Product",
      points: "50 points per review"
    },
    {
      title: "Share on Social Media",
      points: "20 points per share"
    }
  ];

  return (
    <>
      <Header title={t("How to Get Points")} />
      <div className="p-5 space-y-8">
        {/* Points Rules */}
        <section className="space-y-4">
          {pointRules.map((rule) => (
            <div key={rule.type} className="flex items-center justify-between bg-darkgray p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="border border-[#252525] rounded-full h-9 w-9 flex items-center justify-center">
                  {rule.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t(rule.title)}</h3>
                  <p className="text-[#979797] text-xs">{rule.description}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Ways to Earn */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{t("Ways to Earn Points")}</h2>
          <div className="space-y-3">
            {earnMethods.map((method, index) => (
              <div key={index} className="bg-darkgray p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm">{t(method.title)}</h3>
                  <span className="text-mainorange text-sm font-semibold">{method.points}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Terms */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("Terms & Conditions")}</h2>
          <div className="text-sm text-[#979797] space-y-2">
            <p>{t("Points are valid for 12 months from the date of issue")}</p>
            <p>{t("Points cannot be transferred or exchanged for cash")}</p>
            <p>{t("Points can only be earned on paid purchases")}</p>
          </div>
        </section>
      </div>
    </>
  );
};

export default HowToGetPoints;
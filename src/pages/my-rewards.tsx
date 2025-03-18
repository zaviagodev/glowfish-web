import { PageHeader } from "@/components/shared/PageHeader";
import { useRewards } from "@/features/rewards";
import { MyReward } from "@/features/rewards/components/MyReward";

const MyRewardsPage = () => {
  {
    /* This is just to fetch all rewards, but this page is needed to filter purchased rewards */
  }
  const { rewards } = useRewards();
  return (
    <div className="bg-background">
      <PageHeader title="My Rewards" />
      <div className="pt-14">
        <div className="p-5">
          <h2 className="text-sm font-medium mb-2">
            My Rewards ({rewards.length})
          </h2>
          <div className="flex flex-col gap-4">
            {rewards.map((reward) => (
              <MyReward key={reward.id} reward={reward} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRewardsPage;

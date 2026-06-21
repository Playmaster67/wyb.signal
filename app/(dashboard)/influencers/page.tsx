import { InfluencerList } from "@/components/influencers/influencer-list";
import { getInfluencers } from "@/lib/influencers/data";

export default async function InfluencersPage() {
  const influencers = await getInfluencers();

  return (
    <div className="flex flex-col gap-4 p-4">
      <InfluencerList initialData={influencers} />
    </div>
  );
}

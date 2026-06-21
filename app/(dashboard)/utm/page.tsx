import { UTMList } from "@/components/utm/utm-list";
import { getInfluencers } from "@/lib/influencers/data";

export default async function UTMPage() {
  const influencers = await getInfluencers();

  return (
    <div className="flex flex-col gap-4 p-4">
      <UTMList initialData={influencers} />
    </div>
  );
}

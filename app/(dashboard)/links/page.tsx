import { LinkBuilder } from "@/components/links/link-builder";
import { getLinksPageData } from "@/lib/links/data";

export default async function LinksPage() {
  const { influencers, links } = await getLinksPageData();

  return (
    <div className="flex flex-col gap-4 p-4">
      <LinkBuilder initialInfluencers={influencers} initialLinks={links} />
    </div>
  );
}

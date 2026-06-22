import { redirect } from "next/navigation";

// Aba UTM foi unificada na aba Links — o parâmetro utm_inf já vem embutido
// no link gerado automaticamente pra cada influencer.
export default function UTMPage() {
  redirect("/links");
}

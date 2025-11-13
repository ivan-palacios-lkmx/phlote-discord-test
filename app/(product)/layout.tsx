import OnlyMembers from "@/components/OnlyMembers/OnlyMembers";

import "./layout.scss";

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="page">
      <OnlyMembers>{children}</OnlyMembers>
    </main>
  );
}

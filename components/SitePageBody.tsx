import { parseSitePageBody } from "@/lib/site-pages-shared";

export function SitePageBody({ body }: { body: string }) {
  const blocks = parseSitePageBody(body);
  return (
    <div className="legal-body">
      {blocks.map((block, i) => {
        if (block.type === "h2") return <h2 key={i}>{block.text}</h2>;
        if (block.type === "ul") return <ul key={i}>{block.items.map((item, j) => <li key={j}>{item}</li>)}</ul>;
        return <p key={i}>{block.text}</p>;
      })}
    </div>
  );
}

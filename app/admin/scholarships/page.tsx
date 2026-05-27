import { CrudResource } from "@/components/admin/CrudResource";

export default function AdminScholarshipsPage() {
  return (
    <CrudResource
      title="Scholarship opportunities"
      description="Create and review scholarship records stored in PostgreSQL through Prisma."
      endpoint="/api/scholarships?admin=true"
      fields={[
        { name: "title", label: "Title", full: true },
        { name: "slug", label: "Slug" },
        { name: "provider", label: "Provider" },
        { name: "summary", label: "Summary", type: "textarea", full: true },
        { name: "description", label: "Description", type: "textarea", full: true },
        { name: "applicationUrl", label: "Application URL", type: "url" },
        { name: "sourceUrl", label: "Source URL", type: "url" },
        { name: "eligibleLevels[]", label: "Eligible levels, comma-separated", placeholder: "MASTERS,PHD" },
        { name: "eligibleCountries[]", label: "Countries, comma-separated" },
        { name: "regions[]", label: "Regions, comma-separated" },
        { name: "fields[]", label: "Fields, comma-separated" },
        { name: "fundingTypes[]", label: "Funding types, comma-separated", placeholder: "FULLY_FUNDED,FELLOWSHIP" },
        { name: "deadline", label: "Deadline", type: "datetime-local" },
        { name: "deadlineLabel", label: "Deadline label" },
        { name: "amount", label: "Amount" },
        { name: "isPublished", label: "Publish?", type: "select", options: ["false", "true"] }
      ]}
    />
  );
}

import { CrudResource } from "@/components/admin/CrudResource";

export default function AdminNewsletterPage() {
  return (
    <CrudResource
      title="Newsletter subscribers"
      description="View and collect newsletter signups."
      endpoint="/api/newsletter"
      fields={[
        { name: "email", label: "Email", type: "email" },
        { name: "name", label: "Name" },
        { name: "interests[]", label: "Interests, comma-separated", full: true }
      ]}
    />
  );
}

import { CrudResource } from "@/components/admin/CrudResource";

export default function AdminSavedScholarshipsPage() {
  return (
    <CrudResource
      title="Saved scholarships"
      description="Authenticated users can save scholarship opportunities for later."
      endpoint="/api/saved-scholarships"
    />
  );
}

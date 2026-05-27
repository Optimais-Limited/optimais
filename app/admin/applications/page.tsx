import { CrudResource } from "@/components/admin/CrudResource";

export default function AdminApplicationsPage() {
  return (
    <CrudResource
      title="Application tracker"
      description="Authenticated users can track scholarship application progress here."
      endpoint="/api/application-tracker"
    />
  );
}

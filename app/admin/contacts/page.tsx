import { CrudResource } from "@/components/admin/CrudResource";

export default function AdminContactsPage() {
  return (
    <CrudResource
      title="Contact messages"
      description="View inbound website inquiries."
      endpoint="/api/contact"
    />
  );
}

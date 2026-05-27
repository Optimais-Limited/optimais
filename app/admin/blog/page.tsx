import { CrudResource } from "@/components/admin/CrudResource";

export default function AdminBlogPage() {
  return (
    <CrudResource
      title="Blog and insights CMS"
      description="Create editorial drafts and published Optimais insights."
      endpoint="/api/blog?admin=true"
      fields={[
        { name: "title", label: "Title", full: true },
        { name: "slug", label: "Slug" },
        { name: "status", label: "Status", type: "select", options: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
        { name: "excerpt", label: "Excerpt", type: "textarea", full: true },
        { name: "content", label: "Content", type: "textarea", full: true },
        { name: "coverImage", label: "Cover image URL", type: "url" },
        { name: "tags[]", label: "Tags, comma-separated" }
      ]}
    />
  );
}

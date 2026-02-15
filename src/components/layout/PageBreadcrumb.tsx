import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem as BreadcrumbListItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface CrumbItem {
  label: string;
  href?: string;
}

export default function PageBreadcrumb({ items }: { items: CrumbItem[] }) {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbListItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbListItem>
        {items.map((item, i) => (
          <span key={i} className="contents">
            <BreadcrumbSeparator />
            <BreadcrumbListItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbListItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

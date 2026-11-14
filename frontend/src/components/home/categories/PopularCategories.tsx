import { EmptyState } from "@/components/shared/EmptyState";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { Category } from "@/types/category";
import { CategoryCard } from "./CategoryCard";

interface PopularCategoriesProps {
  categories: Category[];
}

export function PopularCategories({ categories }: PopularCategoriesProps) {
  const visible = categories.slice(0, 8);

  return (
    <SectionContainer id="categories">
      <SectionHeading
        eyebrow="Browse by genre"
        title="Popular Categories"
        description="Find your next read by exploring the categories readers visit most."
        action={{ label: "View All Categories", href: "/categories" }}
      />

      <div className="mt-8">
        {visible.length === 0 ? (
          <EmptyState
            icon="LayoutGrid"
            title="Categories are on the way"
            description="Categories will appear here once the catalogue is available."
            action={{ label: "Browse Books", href: "/books" }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}

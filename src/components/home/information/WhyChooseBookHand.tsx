import { Icon } from "@/components/shared/Icon";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { Feature } from "@/types/home";

interface WhyChooseBookHandProps {
  features: Feature[];
}

export function WhyChooseBookHand({ features }: WhyChooseBookHandProps) {
  const visible = features
    .filter((feature) => feature.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <SectionContainer>
      <SectionHeading
        eyebrow="Built for readers and sellers"
        title="Why Choose BookHand"
        description="A book marketplace focused on discovery, independent sellers, and straightforward communication."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-book)]"
          >
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon name={feature.icon} className="size-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}

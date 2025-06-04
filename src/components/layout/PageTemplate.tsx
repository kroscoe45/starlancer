import { ReactNode } from "react";

export interface PageTemplateProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PageTemplate({
  title,
  description,
  children,
}: PageTemplateProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

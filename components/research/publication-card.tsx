import { ArrowUpRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Publication } from "@/lib/types";
import { getI18n } from "@/lib/i18n/server";

export async function PublicationCard({ publication }: { publication: Publication }) {
  const { t } = await getI18n();
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-mono text-[10px] font-normal">
          {publication.venue}
        </Badge>
        <Badge className="font-mono text-[10px] font-normal">{t.research.statuses[publication.status] ?? publication.status}</Badge>
        <span className="font-mono text-[11px] text-muted-foreground">{publication.year}</span>
      </div>

      <h3 className="flex items-start gap-2 text-lg font-semibold leading-snug tracking-tight">
        <FileText className="mt-1 size-4 shrink-0 text-primary" />
        {publication.title}
      </h3>

      <p className="text-sm text-muted-foreground">{publication.area}</p>
      <p className="text-pretty text-sm text-foreground/85">{publication.summary}</p>

      {publication.link && publication.link !== "#" && (
        <a
          href={publication.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t.research.viewPublication} <ArrowUpRight className="size-3.5 rtl:-scale-x-100" />
        </a>
      )}
    </article>
  );
}

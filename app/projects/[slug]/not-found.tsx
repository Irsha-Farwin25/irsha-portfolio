import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n/server";

export default async function ProjectNotFound() {
  const { t } = await getI18n();
  return (
    <Container className="flex flex-col items-center gap-4 py-32 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">{t.projects.notFoundTitle}</h1>
      <p className="max-w-sm text-muted-foreground">
        {t.projects.notFoundBody}
      </p>
      <Button
        nativeButton={false}
        render={
          <Link href="/projects">
            <ArrowLeft data-icon="inline-start" className="rtl:-scale-x-100" /> {t.projects.backToProjects}
          </Link>
        }
      />
    </Container>
  );
}

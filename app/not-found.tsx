import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <Container className="flex flex-col items-center gap-4 py-32 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">{t.notFound.title}</h1>
      <p className="max-w-sm text-muted-foreground">
        {t.notFound.body}
      </p>
      <Button
        nativeButton={false}
        render={
          <Link href="/">
            <ArrowLeft data-icon="inline-start" className="rtl:-scale-x-100" /> {t.notFound.back}
          </Link>
        }
      />
    </Container>
  );
}

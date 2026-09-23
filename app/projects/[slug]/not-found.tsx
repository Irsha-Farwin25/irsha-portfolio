import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function ProjectNotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-32 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Project not found</h1>
      <p className="max-w-sm text-muted-foreground">
        This project doesn&apos;t exist or may have been renamed.
      </p>
      <Button
        nativeButton={false}
        render={
          <Link href="/projects">
            <ArrowLeft data-icon="inline-start" /> Back to projects
          </Link>
        }
      />
    </Container>
  );
}

"use client";

import { useTransition } from "react";
import { dropUnit } from "@/lib/actions/registration";
import { Button } from "@/components/ui/button";

export function DropUnitButton({ registrationId }: { registrationId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => startTransition(() => dropUnit(registrationId))}
    >
      {pending ? "Dropping..." : "Drop"}
    </Button>
  );
}

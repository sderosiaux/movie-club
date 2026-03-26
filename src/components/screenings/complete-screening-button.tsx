"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { completeScreening } from "@/app/(app)/screenings/actions";
import { CheckCircleIcon, Loader2Icon } from "lucide-react";

type Props = {
  screeningId: string;
};

export function CompleteScreeningButton({ screeningId }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      size="lg"
      className="w-full"
      disabled={pending}
      onClick={() => startTransition(() => completeScreening(screeningId))}
    >
      {pending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <CheckCircleIcon className="size-4" />
      )}
      Mark as Complete
    </Button>
  );
}

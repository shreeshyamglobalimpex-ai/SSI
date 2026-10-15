"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { memo, useCallback, useState } from "react";
import { toast } from "sonner";
import { contactService } from "@/lib/api/services";
import { ApiError } from "@/lib/api/client";

/** Pulls the per-field error map off a thrown ApiError, if present. */
function readFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiError) {
    const fields = (error.payload as { fields?: Record<string, string> })
      ?.fields;
    if (fields && typeof fields === "object") return fields;
  }
  return {};
}

export function ContactForm() {
  const [status, setStatus] = useState<string>("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = useCallback(
    async (values: ContactInput) => {
      setStatus("");
      try {
        await contactService.submit(values);
        reset();
        toast.success("Thank you. Your message has been received.");
        setStatus("Thank you. Your message has been received.");
      } catch (error) {
        // Prefer server field errors (mapped inline) over a generic message.
        const fields = readFieldErrors(error);
        const entries = Object.entries(fields);
        if (entries.length > 0) {
          for (const [field, message] of entries) {
            setError(field as keyof ContactInput, { type: "server", message });
          }
          setStatus("Please fix the highlighted fields and try again.");
        } else {
          setStatus(
            error instanceof ApiError
              ? error.message
              : "Something went wrong. Please try again.",
          );
        }
      }
    },
    [reset, setError],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {status && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          {status}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>
          <Input {...register("name")} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone">
          <Input {...register("phone")} />
        </Field>
        <Field label="Company">
          <Input {...register("company")} />
        </Field>
      </div>
      <Field label="Subject">
        <Input {...register("subject")} />
      </Field>
      <Field label="Message" error={errors.message?.message}>
        <Textarea
          {...register("message")}
          placeholder="Tell us about your requirement..."
        />
      </Field>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}

const Field = memo(function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

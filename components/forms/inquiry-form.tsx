"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquirySchema, type InquiryInput } from "@/lib/validations/inquiry";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { memo, useCallback, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { inquiryService } from "@/lib/api/services";

/** Pulls the per-field error map off a thrown ApiError, if present. */
function readFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiError) {
    const fields = (error.payload as { fields?: Record<string, string> })
      ?.fields;
    if (fields && typeof fields === "object") return fields;
  }
  return {};
}

export function InquiryForm() {
  const [status, setStatus] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InquiryInput>({ resolver: zodResolver(inquirySchema) });

  const submit = useCallback(
    async (values: InquiryInput) => {
      setStatus("");
      try {
        await inquiryService.submit(values);
        reset();
        toast.success("Your inquiry has been submitted successfully.");
        setStatus(
          "Inquiry submitted successfully. Our team can review your requirements.",
        );
      } catch (error) {
        // Prefer server field errors (mapped inline) over a generic message.
        const fields = readFieldErrors(error);
        const entries = Object.entries(fields);
        if (entries.length > 0) {
          for (const [field, message] of entries) {
            setError(field as keyof InquiryInput, { type: "server", message });
          }
          setStatus("Please fix the highlighted fields and try again.");
        } else {
          setStatus(
            error instanceof ApiError
              ? error.message
              : "Unable to submit inquiry.",
          );
        }
      }
    },
    [reset, setError],
  );

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {status && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          {status}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={errors.name?.message}>
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
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Country" error={errors.country?.message}>
          <Input {...register("country")} />
        </Field>
        <Field label="Product / medicine" error={errors.productName?.message}>
          <Input {...register("productName")} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Quantity / requirement">
          <Input {...register("quantity")} />
        </Field>
        <Field label="Delivery location" error={errors.deliveryLocation?.message}>
          <Input {...register("deliveryLocation")} />
        </Field>
      </div>
      <Field label="Message" error={errors.message?.message}>
        <Textarea
          {...register("message")}
          placeholder="Describe the products, specifications or business requirement."
        />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit inquiry"}
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

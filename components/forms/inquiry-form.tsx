"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquirySchema, type InquiryInput } from "@/lib/validations/inquiry";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function InquiryForm() {
  const [status, setStatus] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InquiryInput>({ resolver: zodResolver(inquirySchema) });
  async function submit(values: InquiryInput) {
    setStatus("");
    const r = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const d: { success?: boolean; error?: string } = await r.json();
    if (!r.ok || !d.success) {
      toast.error(d.error ?? "Unable to submit inquiry.");
      setStatus(d.error ?? "Unable to submit inquiry.");
      return;
    }
    reset();
    toast.success("Your inquiry has been submitted successfully.");
    setStatus(
      "Inquiry submitted successfully. Our team can review your requirements.",
    );
  }
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
        <Field label="Product / medicine">
          <Input {...register("product")} />
        </Field>
      </div>
      <Field label="Quantity / requirement">
        <Input {...register("quantity")} />
      </Field>
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
function Field({
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
}

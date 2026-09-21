"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function ContactForm() {
  const [status, setStatus] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });
  async function onSubmit(values: ContactInput) {
    setStatus("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data: { success?: boolean; error?: string } = await res.json();
    if (!res.ok || !data.success) {
      toast.error(data.error ?? "Something went wrong.");
      setStatus(data.error ?? "Something went wrong.");
      return;
    }
    reset();
    toast.success("Thank you. Your message has been received.");
    setStatus("Thank you. Your message has been received.");
  }
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

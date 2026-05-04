import type { FC } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ContactFormLabels, ContactFormPayload, ContactFormProps } from "./ContactForm.interfaces";

type Status = "idle" | "submitting" | "success" | "error";

const buildSchema = (labels: ContactFormLabels): z.ZodType<ContactFormPayload> =>
  z.object({
    name: z.string().min(1, labels.error_required),
    email: z.email(labels.error_email).min(1, labels.error_required),
    company: z.string().default(""),
    service: z.string().min(1, labels.error_required),
    message: z.string().min(8, labels.error_min.replace("{min}", "8")),
  });

export const ContactForm: FC<ContactFormProps> = ({ labels, endpoint }) => {
  const [status, setStatus] = useState<Status>("idle");
  const schema = buildSchema(labels);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormPayload>({
    defaultValues: { name: "", email: "", company: "", service: "", message: "" },
    mode: "onBlur",
  });

  const onSubmit = async (raw: ContactFormPayload): Promise<void> => {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="contact-success" role="status" aria-live="polite">
        <span className="check-medallion" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12l4 4 10-10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p style={{ margin: 0 }}>{labels.sent}</p>
      </div>
    );
  }

  return (
    <form className="contact-form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="field-row">
        <div className="field">
          <label htmlFor="contact-name">{labels.name}</label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <span id="contact-name-error" role="alert" className="field-error">
              {errors.name.message}
            </span>
          )}
        </div>
        <div className="field">
          <label htmlFor="contact-email">{labels.email}</label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <span id="contact-email-error" role="alert" className="field-error">
              {errors.email.message}
            </span>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="contact-company">{labels.company}</label>
        <input id="contact-company" type="text" autoComplete="organization" {...register("company")} />
      </div>

      <div className="field">
        <label htmlFor="contact-service">{labels.service}</label>
        <select
          id="contact-service"
          aria-invalid={errors.service ? "true" : "false"}
          aria-describedby={errors.service ? "contact-service-error" : undefined}
          {...register("service")}
        >
          <option value="">—</option>
          {labels.service_opts.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.service && (
          <span id="contact-service-error" role="alert" className="field-error">
            {errors.service.message}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="contact-message">{labels.message}</label>
        <textarea
          id="contact-message"
          aria-invalid={errors.message ? "true" : "false"}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          {...register("message")}
        />
        {errors.message && (
          <span id="contact-message-error" role="alert" className="field-error">
            {errors.message.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "submitting"}
        aria-busy={status === "submitting" ? "true" : "false"}
      >
        <span>{status === "submitting" ? labels.sending : labels.submit}</span>
        <svg className="arrow" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {status === "error" && (
        <div role="alert" className="field-error" style={{ marginTop: 4 }}>
          {labels.error_generic}
        </div>
      )}
    </form>
  );
};

export default ContactForm;

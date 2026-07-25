"use client";

import { FormEvent, useState } from "react";
import { contactInfo } from "@/lib/site-data";

type FormState = {
  name: string;
  email: string;
  message: string;
};

const emptyForm: FormState = { name: "", email: "", message: "" };

export function ContactSection() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      return;
    }
    setStatus("sent");
    setForm(emptyForm);
  }

  return (
    <>
      <section aria-label="Store map" className="w-full">
        <iframe
          title={contactInfo.mapTitle}
          src={contactInfo.mapSrc}
          className="block h-[530px] w-full border-0 max-[880px]:h-[360px] max-[767px]:h-[280px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </section>

      <section
        className="my-[80px] max-[880px]:my-[50px]"
        aria-labelledby="send-message-heading"
      >
        <div className="shell">
          <div className="grid gap-y-10 lg:grid-cols-[65fr_35fr] lg:gap-x-0">
            {/* Form column */}
            <div className="lg:border-r lg:border-[#d6d6d6] lg:pr-10">
              <h2
                id="send-message-heading"
                className="font-fredoka text-[28px] font-medium leading-9 text-ink sm:text-[30px] sm:leading-10"
              >
                Send A Message
              </h2>

              <form
                onSubmit={onSubmit}
                noValidate
                className="mt-6"
                aria-label="Contact form"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="sr-only">Your name</span>
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      required
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => {
                        setStatus("idle");
                        setForm((f) => ({ ...f, name: e.target.value }));
                      }}
                      className="h-12 w-full rounded-[10px] border border-[#d6d6d6] bg-white px-5 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">Your email</span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      placeholder="Your email"
                      value={form.email}
                      onChange={(e) => {
                        setStatus("idle");
                        setForm((f) => ({ ...f, email: e.target.value }));
                      }}
                      className="h-12 w-full rounded-[10px] border border-[#d6d6d6] bg-white px-5 font-poppins text-[14px] text-ink placeholder:text-body focus:border-salmon focus:outline-none"
                    />
                  </label>
                </div>

                <label className="mt-5 block">
                  <span className="sr-only">Your message</span>
                  <textarea
                    name="message"
                    required
                    rows={8}
                    placeholder="Your message"
                    value={form.message}
                    onChange={(e) => {
                      setStatus("idle");
                      setForm((f) => ({ ...f, message: e.target.value }));
                    }}
                    className="min-h-[232px] w-full resize-y rounded-[10px] border border-[#d6d6d6] bg-white px-5 py-2.5 font-poppins text-[14px] leading-6 text-ink placeholder:text-body focus:border-salmon focus:outline-none"
                  />
                </label>

                <button
                  type="submit"
                  className="mt-5 rounded-[40px] bg-gradient-to-b from-salmon-soft to-[#f7baad] px-[25px] py-3 font-poppins text-[16px] font-semibold uppercase leading-6 text-white transition-opacity hover:opacity-90"
                >
                  Submit
                </button>

                <div className="mt-3 min-h-[24px]" aria-live="polite">
                  {status === "sent" ? (
                    <p className="font-poppins text-[14px] leading-6 text-steel">
                      Thanks! Your message has been sent.
                    </p>
                  ) : null}
                  {status === "error" ? (
                    <p className="font-poppins text-[14px] leading-6 text-[#c0392b]">
                      Please fill in your name, email, and message.
                    </p>
                  ) : null}
                </div>
              </form>
            </div>

            {/* Info column */}
            <div className="lg:pl-[25px]">
              <div>
                <h2 className="font-fredoka text-[28px] font-medium leading-9 text-ink sm:text-[30px] sm:leading-10">
                  Store Location
                </h2>
                <ul className="mt-4 space-y-2 font-poppins text-[14px] leading-6 text-body">
                  {contactInfo.stores.map((store) => (
                    <li key={store}>{store}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <h2 className="font-fredoka text-[28px] font-medium leading-9 text-ink sm:text-[30px] sm:leading-10">
                  Contact
                </h2>
                <ul className="mt-4 space-y-2 font-poppins text-[14px] leading-6 text-body">
                  <li>
                    Mobile:{" "}
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="transition-colors hover:text-salmon"
                    >
                      {contactInfo.phone}
                    </a>
                  </li>
                  <li>
                    Hotline:{" "}
                    <a
                      href={`tel:${contactInfo.hotline}`}
                      className="transition-colors hover:text-salmon"
                    >
                      {contactInfo.hotline}
                    </a>
                  </li>
                  <li>
                    Email:{" "}
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="transition-colors hover:text-salmon"
                    >
                      {contactInfo.email}
                    </a>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <h2 className="font-fredoka text-[28px] font-medium leading-9 text-ink sm:text-[30px] sm:leading-10">
                  Open Hour
                </h2>
                <p className="mt-4 font-poppins text-[14px] leading-6 text-body">
                  {contactInfo.hours}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

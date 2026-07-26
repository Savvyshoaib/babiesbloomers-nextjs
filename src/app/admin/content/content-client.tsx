"use client";

import Image from "next/image";
import { useState } from "react";
import { saveSiteContent } from "@/app/actions/admin";
import { uploadSiteAssets } from "@/app/actions/upload";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";
import { ButtonSpinner } from "@/components/site/button-spinner";
import type { SiteContent } from "@/lib/site-content-types";
import { SOCIAL_NETWORKS } from "@/lib/site-content-types";
import { toast } from "sonner";

function ImageUploadField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function onFile(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("files", files[0]!);
    const result = await uploadSiteAssets(fd);
    setUploading(false);
    if (!result.success || !result.data?.urls?.[0]) {
      toast.error(result.message || "Upload failed");
      return;
    }
    onChange(result.data.urls[0]!);
    toast.success("Image uploaded");
  }

  return (
    <div className="space-y-2">
      <label className="block font-poppins text-[13px] font-medium text-ink">
        {label}
      </label>
      {hint ? (
        <p className="font-poppins text-[12px] text-body">{hint}</p>
      ) : null}
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative size-24 overflow-hidden rounded-xl border border-[#e8e2dc] bg-[#faf9f7]">
          {value ? (
            <Image src={value} alt="" fill className="object-contain p-1" unoptimized />
          ) : (
            <span className="flex size-full items-center justify-center text-[11px] text-body">
              No image
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL"
            className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px] text-ink"
          />
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#e0e0e0] bg-white px-3 font-poppins text-[13px] font-medium text-ink hover:border-salmon hover:text-salmon">
            {uploading ? (
              <>
                <ButtonSpinner />
                Uploading…
              </>
            ) : (
              "Upload from computer"
            )}
            <input
              type="file"
              accept="image/*,.ico"
              className="hidden"
              disabled={uploading}
              onChange={(e) => onFile(e.target.files)}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
      <div>
        <h2 className="font-poppins text-[15px] font-semibold text-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 font-poppins text-[13px] text-body">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function SiteContentForms({ initial }: { initial: SiteContent }) {
  const [content, setContent] = useState<SiteContent>(initial);
  const { formAction, pending } = useAdminAction(saveSiteContent);

  return (
    <form
      action={formAction}
      className="space-y-6"
      onSubmit={(e) => {
        const form = e.currentTarget;
        const hidden = form.querySelector<HTMLInputElement>(
          'input[name="content"]',
        );
        if (hidden) hidden.value = JSON.stringify(content);
      }}
    >
      <input type="hidden" name="content" defaultValue="" />

      <SectionCard
        title="Branding"
        description="Site logo, footer logo, and favicon."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <ImageUploadField
            label="Site logo"
            value={content.branding.logo}
            onChange={(logo) =>
              setContent((c) => ({ ...c, branding: { ...c.branding, logo } }))
            }
          />
          <ImageUploadField
            label="Footer logo"
            value={content.branding.footerLogo}
            onChange={(footerLogo) =>
              setContent((c) => ({
                ...c,
                branding: { ...c.branding, footerLogo },
              }))
            }
          />
          <ImageUploadField
            label="Favicon"
            value={content.branding.favicon}
            onChange={(favicon) =>
              setContent((c) => ({
                ...c,
                branding: { ...c.branding, favicon },
              }))
            }
            hint="PNG or ICO recommended."
          />
        </div>
      </SectionCard>

      <SectionCard title="Hero banner" description="Homepage top full-width banner.">
        <ImageUploadField
          label="Banner image"
          value={content.hero.image}
          onChange={(image) =>
            setContent((c) => ({ ...c, hero: { ...c.hero, image } }))
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Link URL
            </label>
            <input
              value={content.hero.href}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  hero: { ...c.hero, href: e.target.value },
                }))
              }
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Alt text
            </label>
            <input
              value={content.hero.alt}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  hero: { ...c.hero, alt: e.target.value },
                }))
              }
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Kids Wear & Summer Collection banners"
        description="Two promo banners under the hero."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {content.promoBanners.map((banner, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-[#f0ece8] p-4"
            >
              <p className="font-poppins text-[13px] font-semibold text-ink">
                {banner.label || `Banner ${index + 1}`}
              </p>
              <ImageUploadField
                label="Image"
                value={banner.src}
                onChange={(src) =>
                  setContent((c) => {
                    const promoBanners = [...c.promoBanners];
                    promoBanners[index] = { ...promoBanners[index]!, src };
                    return { ...c, promoBanners };
                  })
                }
              />
              <input
                value={banner.label}
                onChange={(e) =>
                  setContent((c) => {
                    const promoBanners = [...c.promoBanners];
                    promoBanners[index] = {
                      ...promoBanners[index]!,
                      label: e.target.value,
                    };
                    return { ...c, promoBanners };
                  })
                }
                placeholder="Label"
                className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
              />
              <input
                value={banner.href}
                onChange={(e) =>
                  setContent((c) => {
                    const promoBanners = [...c.promoBanners];
                    promoBanners[index] = {
                      ...promoBanners[index]!,
                      href: e.target.value,
                    };
                    return { ...c, promoBanners };
                  })
                }
                placeholder="Link URL"
                className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
              />
              <input
                value={banner.alt}
                onChange={(e) =>
                  setContent((c) => {
                    const promoBanners = [...c.promoBanners];
                    promoBanners[index] = {
                      ...promoBanners[index]!,
                      alt: e.target.value,
                    };
                    return { ...c, promoBanners };
                  })
                }
                placeholder="Alt text"
                className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="New Arrivals banner"
        description="Large image beside New Arrivals products on the homepage."
      >
        <ImageUploadField
          label="Banner image"
          value={content.newArrivalsBanner.image}
          onChange={(image) =>
            setContent((c) => ({
              ...c,
              newArrivalsBanner: { ...c.newArrivalsBanner, image },
            }))
          }
        />
        <input
          value={content.newArrivalsBanner.alt}
          onChange={(e) =>
            setContent((c) => ({
              ...c,
              newArrivalsBanner: {
                ...c.newArrivalsBanner,
                alt: e.target.value,
              },
            }))
          }
          placeholder="Alt text"
          className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
        />
      </SectionCard>

      <SectionCard
        title="Social icons"
        description="Footer social links. Add or remove platforms as needed."
      >
        <div className="space-y-3">
          {content.socialLinks.map((link, index) => (
            <div
              key={link.id}
              className="space-y-3 rounded-xl border border-[#f0ece8] p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-poppins text-[13px] font-semibold text-ink">
                  Social {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setContent((c) => ({
                      ...c,
                      socialLinks: c.socialLinks.filter((_, i) => i !== index),
                    }))
                  }
                  className="cursor-pointer font-poppins text-[12px] font-medium text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-center">
                <select
                  value={link.network}
                  onChange={(e) =>
                    setContent((c) => {
                      const socialLinks = [...c.socialLinks];
                      socialLinks[index] = {
                        ...socialLinks[index]!,
                        network: e.target.value as typeof link.network,
                      };
                      return { ...c, socialLinks };
                    })
                  }
                  className="h-10 rounded-lg border border-[#cfcfcf] bg-white px-3 font-poppins text-[13px] capitalize text-ink"
                >
                  {SOCIAL_NETWORKS.map((n) => (
                    <option key={n.value} value={n.value}>
                      {n.label}
                    </option>
                  ))}
                </select>
                <input
                  value={link.href}
                  onChange={(e) =>
                    setContent((c) => {
                      const socialLinks = [...c.socialLinks];
                      socialLinks[index] = {
                        ...socialLinks[index]!,
                        href: e.target.value,
                      };
                      return { ...c, socialLinks };
                    })
                  }
                  placeholder="https://…"
                  className="h-10 rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
                />
                <label className="flex items-center gap-2 font-poppins text-[13px] text-ink">
                  <input
                    type="checkbox"
                    checked={link.enabled}
                    onChange={(e) =>
                      setContent((c) => {
                        const socialLinks = [...c.socialLinks];
                        socialLinks[index] = {
                          ...socialLinks[index]!,
                          enabled: e.target.checked,
                        };
                        return { ...c, socialLinks };
                      })
                    }
                    className="size-4 accent-salmon"
                  />
                  Enabled
                </label>
              </div>
            </div>
          ))}
        </div>
        {content.socialLinks.length < 12 ? (
          <button
            type="button"
            onClick={() =>
              setContent((c) => ({
                ...c,
                socialLinks: [
                  ...c.socialLinks,
                  {
                    id: `social-${Date.now()}`,
                    network: "instagram",
                    href: "",
                    enabled: true,
                  },
                ],
              }))
            }
            className="cursor-pointer font-poppins text-[13px] font-semibold text-salmon hover:underline"
          >
            + Add social icon
          </button>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Contact page"
        description="Control the map, store locations, contact details, and opening hours."
      >
        <label className="flex items-center gap-2 font-poppins text-[13px] font-medium text-ink">
          <input
            type="checkbox"
            checked={content.contact.mapEnabled}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                contact: { ...c.contact, mapEnabled: e.target.checked },
              }))
            }
            className="size-4 accent-salmon"
          />
          Show map on contact page
        </label>

        <label className="block space-y-1.5 font-poppins text-[13px] font-medium text-ink">
          <span>Google Maps embed code</span>
          <textarea
            rows={4}
            value={content.contact.mapEmbedUrl}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                contact: { ...c.contact, mapEmbedUrl: e.target.value },
              }))
            }
            placeholder={'Paste the full <iframe …></iframe> code from Google Maps → Share → Embed a map (or just the src URL).'}
            className="w-full rounded-lg border border-[#cfcfcf] px-3 py-2.5 font-mono text-[12px] leading-5 text-ink"
            spellCheck={false}
          />
          <span className="block font-poppins text-[12px] font-normal text-body">
            Tip: in Google Maps, click Share → Embed a map → Copy HTML, then
            paste it here. We&apos;ll extract the map automatically.
          </span>
        </label>

        <label className="block space-y-1.5 font-poppins text-[13px] font-medium text-ink">
          <span>Map title</span>
          <input
            value={content.contact.mapTitle}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                contact: { ...c.contact, mapTitle: e.target.value },
              }))
            }
            className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
          />
        </label>

        <label className="block space-y-1.5 font-poppins text-[13px] font-medium text-ink">
          <span>Store locations (one per line)</span>
          <textarea
            rows={4}
            value={content.contact.locations.join("\n")}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                contact: {
                  ...c.contact,
                  locations: e.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                },
              }))
            }
            className="w-full rounded-lg border border-[#cfcfcf] px-3 py-2.5 font-poppins text-[13px]"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 font-poppins text-[13px] font-medium text-ink">
            <span>Mobile</span>
            <input
              value={content.contact.phone}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  contact: { ...c.contact, phone: e.target.value },
                }))
              }
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </label>
          <label className="space-y-1.5 font-poppins text-[13px] font-medium text-ink">
            <span>Mobile link</span>
            <input
              value={content.contact.phoneHref}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  contact: { ...c.contact, phoneHref: e.target.value },
                }))
              }
              placeholder="tel:+92… or https://wa.me/…"
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </label>
          <label className="space-y-1.5 font-poppins text-[13px] font-medium text-ink">
            <span>Hotline</span>
            <input
              value={content.contact.hotline}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  contact: { ...c.contact, hotline: e.target.value },
                }))
              }
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </label>
          <label className="space-y-1.5 font-poppins text-[13px] font-medium text-ink">
            <span>Hotline link</span>
            <input
              value={content.contact.hotlineHref}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  contact: { ...c.contact, hotlineHref: e.target.value },
                }))
              }
              placeholder="tel:+92… or https://wa.me/…"
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </label>
          <label className="space-y-1.5 font-poppins text-[13px] font-medium text-ink">
            <span>Contact email</span>
            <input
              type="email"
              value={content.contact.email}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  contact: { ...c.contact, email: e.target.value },
                }))
              }
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </label>
          <label className="space-y-1.5 font-poppins text-[13px] font-medium text-ink">
            <span>Open hours</span>
            <input
              value={content.contact.hours}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  contact: { ...c.contact, hours: e.target.value },
                }))
              }
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Our Vision">
        <input
          value={content.vision.title}
          onChange={(e) =>
            setContent((c) => ({
              ...c,
              vision: { ...c.vision, title: e.target.value },
            }))
          }
          className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
        />
        <textarea
          rows={5}
          value={content.vision.body}
          onChange={(e) =>
            setContent((c) => ({
              ...c,
              vision: { ...c.vision, body: e.target.value },
            }))
          }
          className="w-full rounded-lg border border-[#cfcfcf] px-3 py-2.5 font-poppins text-[13px]"
        />
      </SectionCard>

      <SectionCard
        title="Dreamwear section"
        description="Homepage peach band — image, title, features, CTA, and phone."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ImageUploadField
            label="Background image"
            value={content.dreamwear.backgroundImage}
            onChange={(backgroundImage) =>
              setContent((c) => ({
                ...c,
                dreamwear: { ...c.dreamwear, backgroundImage },
              }))
            }
            hint="Wide peach / salmon band photo."
          />
          <ImageUploadField
            label="Feature image"
            value={content.dreamwear.image}
            onChange={(image) =>
              setContent((c) => ({
                ...c,
                dreamwear: { ...c.dreamwear, image },
              }))
            }
            hint="Main product / model image on the left."
          />
        </div>

        <div>
          <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
            Image alt text
          </label>
          <input
            value={content.dreamwear.imageAlt}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                dreamwear: { ...c.dreamwear, imageAlt: e.target.value },
              }))
            }
            className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
          />
        </div>

        <div>
          <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
            Title
          </label>
          <input
            value={content.dreamwear.title}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                dreamwear: { ...c.dreamwear, title: e.target.value },
              }))
            }
            className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
          />
        </div>

        <div>
          <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
            Description
          </label>
          <textarea
            rows={4}
            value={content.dreamwear.description}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                dreamwear: { ...c.dreamwear, description: e.target.value },
              }))
            }
            className="w-full rounded-lg border border-[#cfcfcf] px-3 py-2.5 font-poppins text-[13px]"
          />
        </div>

        <div>
          <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
            Features (one per line, up to 8)
          </label>
          <textarea
            rows={4}
            value={content.dreamwear.features.join("\n")}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                dreamwear: {
                  ...c.dreamwear,
                  features: e.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .slice(0, 8),
                },
              }))
            }
            className="w-full rounded-lg border border-[#cfcfcf] px-3 py-2.5 font-poppins text-[13px]"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Button label
            </label>
            <input
              value={content.dreamwear.ctaLabel}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  dreamwear: { ...c.dreamwear, ctaLabel: e.target.value },
                }))
              }
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Button link
            </label>
            <input
              value={content.dreamwear.ctaHref}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  dreamwear: { ...c.dreamwear, ctaHref: e.target.value },
                }))
              }
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Phone
            </label>
            <input
              value={content.dreamwear.phone}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  dreamwear: { ...c.dreamwear, phone: e.target.value },
                }))
              }
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Phone link
            </label>
            <input
              value={content.dreamwear.phoneHref}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  dreamwear: { ...c.dreamwear, phoneHref: e.target.value },
                }))
              }
              placeholder="tel:+92… or https://wa.me/…"
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Phone caption
            </label>
            <input
              value={content.dreamwear.phoneLabel}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  dreamwear: { ...c.dreamwear, phoneLabel: e.target.value },
                }))
              }
              className="h-10 w-full rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Testimonials"
        description="Homepage parent reviews. Upload avatars and edit quotes."
      >
        <div className="space-y-6">
          {content.testimonials.map((item, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-[#f0ece8] p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-poppins text-[13px] font-semibold text-ink">
                  Review {index + 1}
                </p>
                {content.testimonials.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setContent((c) => ({
                        ...c,
                        testimonials: c.testimonials.filter((_, i) => i !== index),
                      }))
                    }
                    className="cursor-pointer font-poppins text-[12px] font-medium text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <ImageUploadField
                label="Avatar"
                value={item.avatar}
                onChange={(avatar) =>
                  setContent((c) => {
                    const testimonials = [...c.testimonials];
                    testimonials[index] = { ...testimonials[index]!, avatar };
                    return { ...c, testimonials };
                  })
                }
              />
              <textarea
                rows={3}
                value={item.quote}
                onChange={(e) =>
                  setContent((c) => {
                    const testimonials = [...c.testimonials];
                    testimonials[index] = {
                      ...testimonials[index]!,
                      quote: e.target.value,
                    };
                    return { ...c, testimonials };
                  })
                }
                placeholder="Quote"
                className="w-full rounded-lg border border-[#cfcfcf] px-3 py-2.5 font-poppins text-[13px]"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={item.name}
                  onChange={(e) =>
                    setContent((c) => {
                      const testimonials = [...c.testimonials];
                      testimonials[index] = {
                        ...testimonials[index]!,
                        name: e.target.value,
                      };
                      return { ...c, testimonials };
                    })
                  }
                  placeholder="Name"
                  className="h-10 rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
                />
                <input
                  value={item.role}
                  onChange={(e) =>
                    setContent((c) => {
                      const testimonials = [...c.testimonials];
                      testimonials[index] = {
                        ...testimonials[index]!,
                        role: e.target.value,
                      };
                      return { ...c, testimonials };
                    })
                  }
                  placeholder="Role (e.g. Mom of Anna)"
                  className="h-10 rounded-lg border border-[#cfcfcf] px-3 font-poppins text-[13px]"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setContent((c) => ({
                ...c,
                testimonials: [
                  ...c.testimonials,
                  {
                    quote: "",
                    name: "",
                    role: "",
                    avatar: "/images/client1.jpg",
                  },
                ],
              }))
            }
            className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-[#e0e0e0] px-4 font-poppins text-[13px] font-medium text-ink hover:border-salmon hover:text-salmon"
          >
            Add testimonial
          </button>
        </div>
      </SectionCard>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <AdminSubmitButton
          pending={pending}
          label="Save all site content"
          pendingLabel="Saving…"
          className="shadow-lg"
        />
      </div>
    </form>
  );
}

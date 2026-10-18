import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "@shared/types";
import { LOCALES } from "@shared/types";
import { localePath, sectionAlternates, type Alternates, type SectionKey } from "@shared/constants";
import { getTranslations } from "@i18n";

export type Service = CollectionEntry<"services">;
export type Project = CollectionEntry<"projects">;
export type Post = CollectionEntry<"blog">;

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

export const getServices = async (locale: Locale): Promise<Service[]> =>
  (await getCollection("services", (e) => e.data.locale === locale)).sort(byOrder);

export const getProjects = async (locale: Locale): Promise<Project[]> =>
  (await getCollection("projects", (e) => e.data.locale === locale)).sort(byOrder);

/** Drafts are excluded everywhere: routes, listings, sitemap and llms.txt. */
export const getPublishedPosts = async (locale: Locale): Promise<Post[]> =>
  (await getCollection("blog", (e) => e.data.locale === locale && !e.data.draft)).sort(
    (a, b) => (b.data.pubDate?.getTime() ?? 0) - (a.data.pubDate?.getTime() ?? 0),
  );

export const getFaq = async (locale: Locale) => {
  const [entry] = await getCollection("faq", (e) => e.data.locale === locale);
  if (!entry) throw new Error(`Missing FAQ for ${locale}`);
  return entry.data;
};

export const servicePath = (s: Service) => localePath(s.data.locale, "services", s.data.slug);
export const projectPath = (p: Project) => localePath(p.data.locale, "projects", p.data.slug);
export const postPath = (p: Post) => localePath(p.data.locale, "blog", p.id.split("/").pop());

type Keyed = "services" | "projects";

/** Paths of one collection entry in every locale where a translation exists. */
export const entryAlternates = async (collection: Keyed, key: string): Promise<Alternates> => {
  const entries = await getCollection(collection, (e) => e.data.key === key);
  return Object.fromEntries(
    entries.map((e) => [e.data.locale, localePath(e.data.locale, collection, e.data.slug)]),
  );
};

/** Finds the entry with `key` in `locale`, failing the build when a reference is broken. */
export const findByKey = async <C extends Keyed>(
  collection: C,
  locale: Locale,
  key: string,
): Promise<CollectionEntry<C>> => {
  const [entry] = await getCollection(
    collection,
    (e: CollectionEntry<Keyed>) => e.data.locale === locale && e.data.key === key,
  );
  if (!entry) throw new Error(`No ${collection} entry with key "${key}" in ${locale}`);
  return entry as CollectionEntry<C>;
};

/** Resolves an FAQ link (`to` = section key, or "service"/"project" + `key`) to a path. */
export const resolveLink = async (
  locale: Locale,
  link: { to: string; key?: string | undefined },
): Promise<string> => {
  if (link.to === "service" && link.key) return servicePath(await findByKey("services", locale, link.key));
  if (link.to === "project" && link.key) return projectPath(await findByKey("projects", locale, link.key));
  return localePath(locale, link.to as SectionKey);
};

export interface SitePage {
  readonly locale: Locale;
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly alternates: Alternates;
  readonly kind: "page" | "service" | "project" | "post";
}

const STATIC_SECTIONS: ReadonlyArray<Exclude<SectionKey, "blog">> = [
  "home",
  "services",
  "projects",
  "about",
  "faq",
  "contact",
  "privacy",
];

/** Every indexable page of the site. Feeds the sitemap, llms.txt and tests. */
export const getAllPages = async (): Promise<SitePage[]> => {
  const pages: SitePage[] = [];
  for (const locale of LOCALES) {
    const t = getTranslations(locale);
    for (const section of STATIC_SECTIONS) {
      const meta = t.seo[section];
      pages.push({
        locale,
        path: localePath(locale, section),
        title: meta.title,
        description: meta.description,
        alternates: sectionAlternates(section),
        kind: "page",
      });
    }
    for (const s of await getServices(locale)) {
      pages.push({
        locale,
        path: servicePath(s),
        title: s.data.title,
        description: s.data.description,
        alternates: await entryAlternates("services", s.data.key),
        kind: "service",
      });
    }
    for (const p of await getProjects(locale)) {
      pages.push({
        locale,
        path: projectPath(p),
        title: p.data.title,
        description: p.data.description,
        alternates: await entryAlternates("projects", p.data.key),
        kind: "project",
      });
    }
    for (const post of await getPublishedPosts(locale)) {
      pages.push({
        locale,
        path: postPath(post),
        title: post.data.title,
        description: post.data.description,
        alternates: { [locale]: postPath(post) },
        kind: "post",
      });
    }
  }
  return pages;
};

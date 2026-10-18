import { CONTACT, FOUNDER, SITE_URL, localePath } from "@shared/constants";
import { ORG_COPY, absoluteUrl } from "@shared/helpers";
import { getTranslations } from "@i18n";
import { getFaq, getProjects, getServices, projectPath, servicePath } from "@/lib/content";

/**
 * llms.txt (https://llmstxt.org) — an informal proposal, not a standard. It is a
 * plain-text map of the site built from the same content collections as the
 * pages, so it can never drift from what the site publishes.
 */
export const buildLlmsTxt = async (full: boolean): Promise<string> => {
  const es = getTranslations("es");
  const services = await getServices("es");
  const projects = await getProjects("es");
  const servicesEn = await getServices("en");
  const projectsEn = await getProjects("en");
  const lines: string[] = [];

  lines.push("# Markish Tech", "");
  lines.push(`> ${ORG_COPY.es.description}`, "");
  lines.push(
    `- Fundador: ${FOUNDER.name} (${FOUNDER.sameAs.join(", ")})`,
    "- Ubicación: Buenos Aires, Argentina. Trabajo remoto en español e inglés.",
    `- Contacto: ${CONTACT.email} · WhatsApp ${CONTACT.whatsappDisplay} · ${absoluteUrl(localePath("es", "contact"))}`,
    `- Idiomas del sitio: español (${SITE_URL}/es) e inglés (${SITE_URL}/en).`,
    "",
  );

  lines.push("## Servicios", "");
  for (const s of services) {
    lines.push(`- [${s.data.name}](${absoluteUrl(servicePath(s))}): ${full ? s.data.summary.trim() : s.data.card}`);
  }
  lines.push("", "## Proyectos", "");
  for (const p of projects) {
    const relation = es.work.relation[p.data.relation];
    const status = es.work.status[p.data.status];
    lines.push(
      `- [${p.data.name}](${absoluteUrl(projectPath(p))}) (${relation}, ${status}; sitio: ${p.data.url}): ${full ? p.data.summary.trim() : p.data.description}`,
    );
  }
  lines.push("", "## Páginas clave", "");
  for (const key of ["about", "faq", "contact", "privacy"] as const) {
    lines.push(`- [${es.seo[key].title}](${absoluteUrl(localePath("es", key))}): ${es.seo[key].description}`);
  }

  if (full) {
    const faq = await getFaq("es");
    lines.push("", "## Preguntas frecuentes", "");
    for (const group of faq.groups) {
      lines.push(`### ${group.title}`, "");
      for (const item of group.items) lines.push(`**${item.q}**`, "", item.a.trim(), "");
    }
    for (const s of services) {
      lines.push(`## ${s.data.name}`, "", `URL: ${absoluteUrl(servicePath(s))}`, "", s.data.summary.trim(), "");
      lines.push("Incluye:", ...s.data.deliverables.map((d) => `- ${d.title}: ${d.text}`), "");
      lines.push("Cuándo conviene:", ...s.data.whenYes.map((x) => `- ${x}`), "");
      lines.push("Cuándo no conviene:", ...s.data.whenNo.map((x) => `- ${x}`), "");
    }
    for (const p of projects) {
      lines.push(`## Caso: ${p.data.name}`, "", `URL: ${absoluteUrl(projectPath(p))}`, "");
      lines.push(`Problema: ${p.data.problem.trim()}`, "", `Solución: ${p.data.solution.trim()}`, "");
      lines.push("Stack:", ...p.data.stack.map((g) => `- ${g.area}: ${g.items.join(", ")}`), "");
    }
  }

  lines.push("", "## English", "");
  for (const s of servicesEn) lines.push(`- [${s.data.name}](${absoluteUrl(servicePath(s))}): ${s.data.card}`);
  for (const p of projectsEn) lines.push(`- [${p.data.name}](${absoluteUrl(projectPath(p))}): ${p.data.description}`);
  lines.push(`- [FAQ](${absoluteUrl(localePath("en", "faq"))})`, `- [About](${absoluteUrl(localePath("en", "about"))})`);
  if (!full) lines.push("", "## Optional", "", `- [Versión completa](${SITE_URL}/llms-full.txt)`);

  return `${lines.join("\n")}\n`;
};

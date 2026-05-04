export interface NavTranslations {
  readonly services: string;
  readonly work: string;
  readonly process: string;
  readonly quality: string;
  readonly contact: string;
  readonly cta: string;
}

export interface HeroTranslations {
  readonly eyebrow: string;
  readonly status: string;
  readonly title_a: string;
  readonly title_b: string;
  readonly title_c: string;
  readonly subtitle: string;
  readonly cta_primary: string;
  readonly cta_secondary: string;
  readonly stat1_num: string;
  readonly stat1_label: string;
  readonly stat2_num: string;
  readonly stat2_label: string;
  readonly stat3_num: string;
  readonly stat3_label: string;
}

export interface ServiceItem {
  readonly tag: string;
  readonly title: string;
  readonly desc: string;
  readonly foot: string;
}

export interface ServicesTranslations {
  readonly eyebrow: string;
  readonly title: string;
  readonly meta: string;
  readonly items: ReadonlyArray<ServiceItem>;
}

export interface ProblemItem {
  readonly ttl: string;
  readonly desc: string;
}

export interface ProblemsTranslations {
  readonly eyebrow: string;
  readonly title: string;
  readonly meta: string;
  readonly items: ReadonlyArray<ProblemItem>;
}

export interface BeforeAfterStat {
  readonly lbl: string;
  readonly from: string;
  readonly to: string;
  readonly delta: string;
}

export interface BeforeAfterTranslations {
  readonly eyebrow: string;
  readonly title: string;
  readonly meta: string;
  readonly desc: string;
  readonly tag_left: string;
  readonly tag_right: string;
  readonly stats: ReadonlyArray<BeforeAfterStat>;
}

export interface CaseItem {
  readonly industry: string;
  readonly ttl: string;
  readonly badge: string;
}

export interface CasesTranslations {
  readonly eyebrow: string;
  readonly title: string;
  readonly meta: string;
  readonly items: ReadonlyArray<CaseItem>;
}

export interface ProcessStepItem {
  readonly tag: string;
  readonly ttl: string;
  readonly desc: string;
}

export interface ProcessTranslations {
  readonly eyebrow: string;
  readonly title: string;
  readonly meta: string;
  readonly steps: ReadonlyArray<ProcessStepItem>;
}

export interface TechTranslations {
  readonly eyebrow: string;
  readonly title: string;
  readonly items: ReadonlyArray<string>;
}

export interface QualityScore {
  readonly lbl: string;
  readonly num: number;
  readonly grade: string;
}

export interface QualityCheck {
  readonly ttl: string;
  readonly meta: string;
}

export interface QualityTranslations {
  readonly eyebrow: string;
  readonly title: string;
  readonly meta: string;
  readonly desc: string;
  readonly scores: ReadonlyArray<QualityScore>;
  readonly checks: ReadonlyArray<QualityCheck>;
}

export interface CtaTranslations {
  readonly eyebrow: string;
  readonly title: string;
  readonly desc: string;
  readonly btn1: string;
  readonly btn2: string;
}

export interface ContactInfoItem {
  readonly lbl: string;
  readonly val: string;
}

export interface ContactTranslations {
  readonly eyebrow: string;
  readonly title: string;
  readonly meta: string;
  readonly name: string;
  readonly email: string;
  readonly company: string;
  readonly service: string;
  readonly message: string;
  readonly submit: string;
  readonly sending: string;
  readonly sent: string;
  readonly error_generic: string;
  readonly error_required: string;
  readonly error_email: string;
  readonly error_min: string;
  readonly service_opts: ReadonlyArray<string>;
  readonly info: ReadonlyArray<ContactInfoItem>;
}

export type ChatOptionId = "new" | "improve" | "optimize" | "automate" | "audit" | "wa";

export interface ChatOption {
  readonly id: ChatOptionId;
  readonly label: string;
  readonly reply: string;
}

export interface ChatTranslations {
  readonly title: string;
  readonly status: string;
  readonly greet: string;
  readonly restart: string;
  readonly foot: string;
  readonly open_label: string;
  readonly close_label: string;
  readonly options: ReadonlyArray<ChatOption>;
  readonly end: string;
  readonly end_yes: string;
  readonly end_no: string;
}

export interface FootTranslations {
  readonly copy: string;
  readonly meta: string;
}

export interface SeoPageMeta {
  readonly title: string;
  readonly description: string;
  readonly og_title: string;
  readonly og_description: string;
  readonly og_image_alt: string;
}

export interface SeoTranslations {
  readonly home: SeoPageMeta;
}

export interface A11yTranslations {
  readonly skip_to_content: string;
  readonly open_menu: string;
  readonly close_menu: string;
  readonly toggle_theme: string;
  readonly before_after_label: string;
}

export interface Translations {
  readonly nav: NavTranslations;
  readonly hero: HeroTranslations;
  readonly services: ServicesTranslations;
  readonly problems: ProblemsTranslations;
  readonly ba: BeforeAfterTranslations;
  readonly cases: CasesTranslations;
  readonly process: ProcessTranslations;
  readonly tech: TechTranslations;
  readonly quality: QualityTranslations;
  readonly cta: CtaTranslations;
  readonly contact: ContactTranslations;
  readonly chat: ChatTranslations;
  readonly foot: FootTranslations;
  readonly seo: SeoTranslations;
  readonly a11y: A11yTranslations;
}

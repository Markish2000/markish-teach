export interface ContactFormLabels {
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
}

export interface ContactFormProps {
  readonly labels: ContactFormLabels;
  readonly endpoint: string;
}

export interface ContactFormPayload {
  readonly name: string;
  readonly email: string;
  readonly company: string;
  readonly service: string;
  readonly message: string;
}

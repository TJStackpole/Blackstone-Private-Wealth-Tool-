/** Shared shapes for add-on data files (Rule 8: every dataset carries asOf, source and sample). */

export interface AddonSource {
  /** Document name, e.g. "BCRED Form 10-Q, quarter ended June 30, 2026". */
  name: string;
  url: string;
  /** Page or section, when citing a brochure or long filing. */
  page?: string;
}

export interface DatasetMeta {
  asOf: string;
  source: AddonSource;
  sample: boolean;
}

/** A fund term (cap, deduction, fee) is a parameter with a source, never a hard-coded fact. */
export interface FundParam<T = number> {
  value: T;
  source: AddonSource;
  asOf: string;
  /** Default reminder, e.g. "Confirm against current prospectus". */
  verify?: string;
}

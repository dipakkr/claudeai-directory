// Keep in sync with PROFESSIONS in backend/app/models/user.py.
export const PROFESSIONS = [
  "Developer",
  "Founder",
  "Product manager",
  "Designer",
  "Marketer",
  "Data scientist",
  "Researcher",
  "Student",
  "Other",
];

// ISO 3166-1 alpha-2. Names come from the browser (Intl.DisplayNames).
export const COUNTRY_CODES =
  "AF AL DZ AR AM AU AT AZ BH BD BY BE BJ BO BA BR BG KH CM CA CL CN CO CR HR CY CZ DK DO EC EG SV EE ET FI FR GE DE GH GR GT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KR KW KG LV LB LT LU MY MT MX MD MN MA NP NL NZ NI NG MK NO OM PK PA PY PE PH PL PT QA RO RU RW SA SN RS SG SK SI ZA ES LK SE CH TW TZ TH TN TR UG UA AE GB US UY UZ VE VN ZM ZW".split(" ");

/** Country codes with English names, sorted by name. */
export function countryOptions() {
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    return COUNTRY_CODES.map((code) => ({ code, name: names.of(code) ?? code })).sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return COUNTRY_CODES.map((code) => ({ code, name: code }));
  }
}

export function countryName(code?: string) {
  if (!code) return "";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

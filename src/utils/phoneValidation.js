import { allCountries } from "country-telephone-data";
import { AsYouType, isValidPhoneNumber, validatePhoneNumberLength } from "libphonenumber-js";

export const COUNTRY_OPTIONS = allCountries
  .filter((country) => country.iso2 && country.dialCode)
  .map((country) => ({
    name: country.name,
    iso2: country.iso2.toUpperCase(),
    dialCode: country.dialCode,
    code: `+${country.dialCode}`,
    label: `${country.name} (+${country.dialCode})`,
    format: country.format || "",
  }));

export const getCountryByIso = (countryIso = "IN") => {
  const iso = String(countryIso || "IN").toUpperCase();
  return COUNTRY_OPTIONS.find((country) => country.iso2 === iso) || COUNTRY_OPTIONS.find((country) => country.iso2 === "IN");
};

export const getCountryByDialCode = (countryCode = "+91") => {
  const dialCode = String(countryCode || "+91").replace(/\D/g, "");
  return COUNTRY_OPTIONS.find((country) => country.dialCode === dialCode) || getCountryByIso("IN");
};

export const getCountryIsoFromDialCode = (countryCode = "+91") => {
  return getCountryByDialCode(countryCode)?.iso2 || "IN";
};

export const getDialCodeForCountry = (countryIso = "IN") => {
  return getCountryByIso(countryIso)?.code || "+91";
};

export const COUNTRY_RULES = {
  "+91": { name: "India", min: 10, max: 10, pattern: /^[6-9]\d{9}$/, pincodePattern: /^\d{6}$/ },
  "+1": { name: "USA/Canada", min: 10, max: 10, pattern: /^\d{10}$/, pincodePattern: /^\d{5}(-\d{4})?$/ },
  "+44": { name: "United Kingdom", min: 10, max: 11, pattern: /^\d{10,11}$/, pincodePattern: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i },
  "+971": { name: "UAE", min: 9, max: 9, pattern: /^5\d{8}$/, pincodePattern: /^.*?$/ },
  "+966": { name: "Saudi Arabia", min: 9, max: 9, pattern: /^5\d{8}$/, pincodePattern: /^\d{5}$/ },
  "+61": { name: "Australia", min: 9, max: 9, pattern: /^4\d{8}$/, pincodePattern: /^\d{4}$/ },
  "+49": { name: "Germany", min: 10, max: 11, pattern: /^\d{10,11}$/, pincodePattern: /^\d{5}$/ },
  "+33": { name: "France", min: 9, max: 9, pattern: /^[67]\d{8}$/, pincodePattern: /^\d{5}$/ },
  "+65": { name: "Singapore", min: 8, max: 8, pattern: /^[89]\d{7}$/, pincodePattern: /^\d{6}$/ },
  "DEFAULT": { name: "Default", min: 7, max: 15, pattern: /^\d{7,15}$/, pincodePattern: /^.*?$/ }
};

export const ZIPPOPOTAM_COUNTRY_BY_DIAL_CODE = {
  "+91": "IN",
  "+1": "US",
  "+44": "GB",
  "+61": "AU",
  "+49": "DE",
  "+33": "FR",
  "+966": "SA",
  "+65": "SG",
  "+27": "ZA",
  "+31": "NL",
  "+32": "BE",
  "+34": "ES",
  "+39": "IT",
  "+41": "CH",
  "+45": "DK",
  "+46": "SE",
  "+47": "NO",
  "+48": "PL",
  "+52": "MX",
  "+55": "BR",
  "+64": "NZ",
  "+90": "TR",
  "+94": "LK",
  "+351": "PT",
  "+353": "IE",
  "+358": "FI",
  "+370": "LT",
  "+380": "UA",
};

const ZIPPOPOTAM_LOOKUP_PATTERNS = {
  "+91": /^\d{6}$/,
  "+1": /^\d{5}$/,
  "+44": /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
  "+61": /^\d{4}$/,
  "+49": /^\d{5}$/,
  "+33": /^\d{5}$/,
  "+966": /^\d{5}$/,
  "+65": /^\d{6}$/,
  "+27": /^\d{4}$/,
  "+31": /^[1-9]\d{3} ?[A-Z]{2}$/i,
  "+32": /^\d{4}$/,
  "+34": /^\d{5}$/,
  "+39": /^\d{5}$/,
  "+41": /^\d{4}$/,
  "+45": /^\d{4}$/,
  "+46": /^\d{3} ?\d{2}$/,
  "+47": /^\d{4}$/,
  "+48": /^\d{2}-?\d{3}$/,
  "+52": /^\d{5}$/,
  "+55": /^\d{5}-?\d{3}$/,
  "+64": /^\d{4}$/,
  "+90": /^\d{5}$/,
  "+94": /^\d{5}$/,
  "+351": /^\d{4}-?\d{3}$/,
  "+353": /^[A-Z]\d{2} ?[A-Z0-9]{4}$/i,
  "+358": /^\d{5}$/,
  "+370": /^\d{5}$/,
  "+380": /^\d{5}$/,
};

const MOBILE_NATIONAL_PATTERNS_BY_ISO = {
  IN: /^[6-9]\d{9}$/,
  US: /^[2-9]\d{2}[2-9]\d{6}$/,
  CA: /^[2-9]\d{2}[2-9]\d{6}$/,
  GB: /^(?:7\d{9}|07\d{9})$/,
  AE: /^5\d{8}$/,
  SA: /^5\d{8}$/,
  AU: /^(?:4\d{8}|04\d{8})$/,
  DE: /^1[5-7]\d{8,10}$/,
  FR: /^(?:[67]\d{8}|0[67]\d{8})$/,
  SG: /^[89]\d{7}$/,
  ZA: /^(?:[6-8]\d{8}|0[6-8]\d{8})$/,
  NL: /^(?:6\d{8}|06\d{8})$/,
  ES: /^[67]\d{8}$/,
  IT: /^3\d{8,9}$/,
  BR: /^[1-9]{2}9\d{8}$/,
  MX: /^[1-9]\d{9}$/,
  MY: /^(?:1\d{8,9}|01\d{8,9})$/,
  NZ: /^(?:2\d{7,9}|02\d{7,9})$/,
  PK: /^(?:3\d{9}|03\d{9})$/,
  BD: /^(?:1[3-9]\d{8}|01[3-9]\d{8})$/,
  NP: /^9[78]\d{8}$/,
  LK: /^(?:7\d{8}|07\d{8})$/,
};

export const getCountryRule = (countryCode) => {
  return COUNTRY_RULES[countryCode] || COUNTRY_RULES["DEFAULT"];
};

export const getZippopotamCountry = (countryCode, countryIso) => {
  if (countryIso) return String(countryIso).toUpperCase();
  return ZIPPOPOTAM_COUNTRY_BY_DIAL_CODE[countryCode] || null;
};

export const formatPhoneInput = (mobile, countryIso = "IN") => {
  const iso = String(countryIso || "IN").toUpperCase();
  return new AsYouType(iso).input(String(mobile || ""));
};

export const getNationalPhoneDigits = (mobile, countryCode = "+91", countryIso) => {
  const raw = String(mobile || "");
  const trimmed = raw.trim();
  const digits = raw.replace(/\D/g, "");
  const selectedCountry = countryIso ? getCountryByIso(countryIso) : getCountryByDialCode(countryCode);
  if (!selectedCountry) return digits;

  const hasInternationalPrefix = trimmed.startsWith("+") || trimmed.startsWith("00");
  if (hasInternationalPrefix && digits.startsWith(selectedCountry.dialCode) && digits.length > selectedCountry.dialCode.length + 4) {
    return digits.slice(selectedCountry.dialCode.length);
  }

  return digits;
};

export const getPhoneLengthIssue = (mobile, countryCode = "+91", countryIso) => {
  const selectedCountry = countryIso ? getCountryByIso(countryIso) : getCountryByDialCode(countryCode);
  const digits = getNationalPhoneDigits(mobile, countryCode, countryIso);
  if (!digits || !selectedCountry) return null;
  return validatePhoneNumberLength(digits, selectedCountry.iso2);
};

export const isPhoneTooLong = (mobile, countryCode = "+91", countryIso) => {
  return getPhoneLengthIssue(mobile, countryCode, countryIso) === "TOO_LONG";
};

export const getPhoneValidationMessage = (mobile, countryCode = "+91", countryIso) => {
  const selectedCountry = countryIso ? getCountryByIso(countryIso) : getCountryByDialCode(countryCode);
  const digits = getNationalPhoneDigits(mobile, countryCode, countryIso);
  if (!digits) return "";
  if (!selectedCountry) return "Select a valid country";

  const countryName = selectedCountry.name.split(" (")[0];
  const lengthIssue = validatePhoneNumberLength(digits, selectedCountry.iso2);

  if (lengthIssue === "TOO_SHORT") return `Too short for ${countryName}`;
  if (lengthIssue === "TOO_LONG") return `Too long for ${countryName}`;
  if (lengthIssue === "INVALID_LENGTH") return `Invalid number length for ${countryName}`;
  if (lengthIssue) return `Invalid phone number for ${countryName}`;

  const mobilePattern = MOBILE_NATIONAL_PATTERNS_BY_ISO[selectedCountry.iso2];
  if (mobilePattern && !mobilePattern.test(digits)) {
    return `Invalid ${countryName} mobile number. Check starting digits.`;
  }

  if (!isValidPhoneNumber(`+${selectedCountry.dialCode}${digits}`, selectedCountry.iso2)) {
    return `Invalid ${countryName} number. Check starting digits.`;
  }

  return "";
};

export const validatePhone = (mobile, countryCode = "+91", countryIso) => {
  return !getPhoneValidationMessage(mobile, countryCode, countryIso);
};

export const validatePincode = (pincode, countryCode = "+91") => {
  const pin = String(pincode || "").trim();
  const rule = getCountryRule(countryCode);
  return rule.pincodePattern.test(pin);
};

export const shouldLookupPincode = (pincode, countryCode = "+91", countryIso) => {
  const pin = String(pincode || "").trim();
  if (!pin || !getZippopotamCountry(countryCode, countryIso)) return false;

  const lookupPattern = ZIPPOPOTAM_LOOKUP_PATTERNS[countryCode];
  if (!lookupPattern) return false;

  return lookupPattern.test(pin);
};

// `PhoneNumber` is no longer exported: its only external consumer was the
// legacy /about_us page, whose rebuilt replacement (/doctor) reads phone and
// email from Site Settings like the footer does, rather than from a
// hardcoded constant. It stays as a local because `WhatsappNumber` — still
// used by the not-yet-rebuilt send-message and consultation pages — is
// derived from it.
const PhoneNumber = "01155924548";

export const WhatsappNumber = `+2${PhoneNumber}`;

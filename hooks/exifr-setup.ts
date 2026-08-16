// exifr's lite build runs a load-time UA sniff:
//
//   if ("object" == typeof navigator) {
//     let e = navigator.userAgent;
//     e.includes("iPad") || ...   // ← crashes in RN
//   }
//
// React Native defines `navigator` but leaves `userAgent` undefined, so the
// `.includes` call throws at module scope ("Cannot read property 'includes'
// of undefined"). Give it a sane default BEFORE exifr is imported.
if (typeof navigator !== "undefined" && typeof navigator.userAgent !== "string") {
  (navigator as { userAgent?: string }).userAgent = "";
}
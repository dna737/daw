export const castToNumbers = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj;

  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === "object" && v !== null ? castToNumbers(v) : Number(v)
    ])
  );
}

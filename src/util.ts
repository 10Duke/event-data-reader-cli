export function parseDateTime(input?: string): string | undefined {
  if (input === undefined || input === null || input.length === 0) {
    return undefined;
  }

  const digitsOnly = /^\d+$/.test(input);
  if (digitsOnly) {
    return input;
  }

  const epochMillis = Date.parse(input);
  if (epochMillis === NaN) {
    throw new Error(`error: parsing date and time failed from ${input}`);
  }
  return `${epochMillis}000000`;
}

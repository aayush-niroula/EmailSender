export type AddressField = "to" | "cc" | "bcc";

export type FormErrors = Record<string, string[]>;

export const emptyAddresses: Record<AddressField, string[]> = {
    to: [],
    cc: [],
    bcc: [],
};

export function parseAddresses(value: string): string[] {
    return value
        .split(/[\s,;]+/)
        .map((address) => address.trim())
        .filter(Boolean);
}

export function isValidEmail(address: string): boolean {
    return /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@gmail\.com$/.test(address);
}
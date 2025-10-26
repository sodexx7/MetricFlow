export const ONE_BI = 1n;
export const MaxUint256 = 2n ** 256n - 1n;

export function hexToBigInt(hex: string): bigint {
  return BigInt(hex);
}
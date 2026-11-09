// src/types/binary.ts
export const BinaryPosition = {
  LEFT: "LEFT",
  RIGHT: "RIGHT",
} as const;

export type BinaryPosition =
  (typeof BinaryPosition)[keyof typeof BinaryPosition];

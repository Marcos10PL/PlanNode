export type Translations = (key: string) => string;

export type PositionChange = { id: string; position: number };

export type ReorderAction = (
  changes: PositionChange[],
) => Promise<{ error?: string; success?: boolean } | undefined>;

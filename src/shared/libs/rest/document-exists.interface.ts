export interface DocumentExists {
  findById(id: string): Promise<unknown | null>;
}

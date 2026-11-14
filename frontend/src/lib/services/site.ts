import { cacheLife } from "next/cache";

export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");

  return new Date().getFullYear();
}

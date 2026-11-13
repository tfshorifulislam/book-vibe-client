import { handleError, ok, toNumber } from "@/lib/api";
import { getBookCards } from "@/lib/data/books";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await getBookCards({
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      author: searchParams.get("author") ?? undefined,
      publisher: searchParams.get("publisher") ?? undefined,
      shop: searchParams.get("shop") ?? undefined,
      condition: searchParams.get("condition") ?? undefined,
      listingType: searchParams.get("listingType") ?? undefined,
      minPrice: toNumber(searchParams.get("minPrice")),
      maxPrice: toNumber(searchParams.get("maxPrice")),
      onSale: searchParams.get("onSale") === "true",
      featured: searchParams.get("featured") === "true",
      newArrival: searchParams.get("newArrival") === "true",
      bestSeller: searchParams.get("bestSeller") === "true",
      sort: searchParams.get("sort") ?? undefined,
      page: toNumber(searchParams.get("page")),
      limit: toNumber(searchParams.get("limit")),
    });
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}

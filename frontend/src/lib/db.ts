/**
 * Frontend Database Proxy Client
 * Proxies model queries to the Express backend API (http://localhost:5000/api/internal/query).
 * Frontend contains ZERO Prisma or PostgreSQL dependencies.
 */

function createModelProxy(model: string) {
  return new Proxy(
    {},
    {
      get(_target, action: string) {
        if (action === "then") return undefined;

        return async (args?: unknown) => {
          try {
            const apiBase =
              process.env.API_BASE_URL ||
              process.env.NEXT_PUBLIC_API_URL ||
              "http://localhost:5000";

            const secret =
              process.env.SESSION_SECRET ||
              process.env.JWT_SECRET ||
              "bookhand_internal_secret";

            const res = await fetch(`${apiBase}/api/internal/query`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-internal-secret": secret,
              },
              body: JSON.stringify({ model, action, args }),
              cache: "no-store",
            });

            if (!res.ok) {
              if (action === "count") return 0;
              if (action === "findMany") return [];
              return null;
            }

            const json = (await res.json()) as {
              success: boolean;
              data: unknown;
            };
            return json.data;
          } catch {
            if (action === "count") return 0;
            if (action === "findMany") return [];
            return null;
          }
        };
      },
    },
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = new Proxy(
  {},
  {
    get(_target, prop: string) {
      if (prop === "$transaction") {
        return async (fnOrArray: unknown) => {
          if (Array.isArray(fnOrArray)) {
            return Promise.all(fnOrArray);
          }
          if (typeof fnOrArray === "function") {
            return (fnOrArray as (tx: unknown) => Promise<unknown>)(prisma);
          }
          return null;
        };
      }
      if (prop === "$connect" || prop === "$disconnect") {
        return async () => {};
      }
      return createModelProxy(prop);
    },
  },
);

export default prisma;

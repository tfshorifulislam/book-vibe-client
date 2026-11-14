# Fix Authentication Redirect Runtime Error

Fix the runtime error in `src/components/auth/forms.tsx` around line 103–105:

`Cannot read properties of undefined (reading 'startsWith')`

Tasks:

1. Inspect the login/register response types and backend authentication response.
2. Identify why `result.data.redirectTo` can be undefined.
3. Validate the `next` parameter and backend `redirectTo` before navigation.
4. Add a safe default redirect, such as `/dashboard`, if neither contains a valid internal path.
5. Prevent open redirects: accept only paths starting with `/`, reject `//`, external URLs and malformed values.
6. Ensure backend response types accurately represent optional and required fields.
7. Preserve existing role-based redirects for Buyer, Seller and Admin.
8. Do not hide the error with `as string` or non-null assertions.

Example safe logic:

```ts
const isSafePath = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

const destination = isSafePath(next)
  ? next
  : isSafePath(result.data?.redirectTo)
    ? result.data.redirectTo
    : "/dashboard";

router.push(destination);
router.refresh();
```

Verify login and registration for all roles, with and without a `next` parameter. Run TypeScript and relevant tests. Report the root cause and changed files.

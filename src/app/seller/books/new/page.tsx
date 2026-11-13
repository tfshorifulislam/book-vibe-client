import { redirect } from "next/navigation";

export default function NewBookRedirect() {
  redirect("/seller/books/create");
}

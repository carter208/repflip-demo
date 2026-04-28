import { redirect } from "next/navigation";

// /review → canonical route is /submit-review
export default function ReviewRedirect() {
  redirect("/submit-review");
}

import getCurrentUser from "./get-current-user";
import { redirect } from "next/navigation";

export default async function getAdminUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "ADMIN") {
    redirect("/");
  }

  return currentUser;
}

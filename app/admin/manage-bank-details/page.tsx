import getAdminUser from "@/actions/get-admin-user";
import ManageBankDetailsClient from "./manage-bank-details-client";

export default async function ManageBankDetailsPage() {
  await getAdminUser();

  return <ManageBankDetailsClient />;
}

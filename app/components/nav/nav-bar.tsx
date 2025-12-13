import getCurrentUser from "@/actions/get-current-user";
import ClientNavBar from "./nav-bar-client";

// Server component: fetch user and pass to client NavBar
const NavBar = async ({ nextDeliveryTime }: { nextDeliveryTime?: string | null }) => {
  const currentUser = await getCurrentUser();
  return <ClientNavBar currentUser={currentUser} nextDeliveryTime={nextDeliveryTime} />;
};

export default NavBar;

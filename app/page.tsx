export const revalidate = 0;

import Container from "./components/container";
import HomeBanner from "./components/home-banner";
import ProductCard from "./components/products/product-card";
import getProducts, { IProductParams } from "@/actions/get-products";
import NullData from "./components/null-data";
import getCurrentUser from "@/actions/get-current-user";
import getOrdersByUserId from "@/actions/get-orders-by-user-id";
import UserDashboard from "./components/user-dashboard";
import getSettings from "@/actions/get-settings";

interface HomeProps {
  searchParams: IProductParams;
}

export default async function Home({ searchParams }: HomeProps) {
  const products = await getProducts(searchParams);
  const currentUser = await getCurrentUser();
  const settings = await getSettings();
  
  // Get user's orders if logged in
  let userOrders = [];
  if (currentUser) {
    const orders = await getOrdersByUserId(currentUser.id);
    // Serialize orders to plain objects
    userOrders = orders.map((order: any) => ({
      ...order,
      id: order.id.toString(),
      createDate: order.createDate.toISOString(),
      createdAt: order.createdAt?.toISOString(),
      updatedAt: order.updatedAt?.toISOString(),
      cancelledAt: order.cancelledAt?.toISOString() || null,
      reimbursedAt: order.reimbursedAt?.toISOString() || null,
      user: order.user ? {
        ...order.user,
        id: order.user.id.toString(),
        createdAt: order.user.createdAt.toISOString(),
        updatedAt: order.user.updatedAt.toISOString(),
        emailVerified: order.user.emailVerified?.toISOString() || null,
      } : undefined,
    }));
  }

  if (products.length === 0) {
    return (
      <NullData title='Oops! No products found. Click "All" to clear filters.' />
    );
  }

  const shuffleArray = (array: any) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  };

  const shuffledProducts = shuffleArray(products);

  return (
    <div className="p-2 sm:p-8">
      <Container>
        {/* Show user dashboard if logged in, or locked version if not logged in */}
        {currentUser ? (
          userOrders.length > 0 ? (
            <UserDashboard orders={userOrders} userName={currentUser.name || undefined} />
          ) : (
            <div className="bg-gradient-to-r from-zinc-900 to-neutral-900 rounded-lg p-6 shadow-lg mb-8">
              <h2 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-3xl">👋</span>
                Welcome back, {currentUser.name || 'there'}!
              </h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-center">
                  <div className="text-5xl mb-4">🛒</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Orders Yet</h3>
                  <p className="text-white/80 mb-4">
                    You haven&apos;t placed any orders yet. Start shopping to see your order history here!
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {/* Total Orders */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white text-xl">🛒</span>
                        <p className="text-white/80 text-xs font-medium">Total Orders</p>
                      </div>
                      <p className="text-white text-3xl font-bold">0</p>
                    </div>
                    
                    {/* Completed Orders */}
                    <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4 border border-green-400/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-300 text-xl">✓</span>
                        <p className="text-green-100 text-xs font-medium">Completed</p>
                      </div>
                      <p className="text-green-50 text-3xl font-bold">0</p>
                      <p className="text-green-200 text-xs mt-1">₦0 spent</p>
                    </div>
                    
                    {/* Pending Orders */}
                    <div className="bg-amber-500/20 backdrop-blur-sm rounded-lg p-4 border border-amber-400/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-amber-300 text-xl">⏳</span>
                        <p className="text-amber-100 text-xs font-medium">Pending</p>
                      </div>
                      <p className="text-amber-50 text-3xl font-bold">0</p>
                    </div>
                    
                    {/* Cancelled Orders */}
                    <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 border border-red-400/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-300 text-xl">✕</span>
                        <p className="text-red-100 text-xs font-medium">Cancelled</p>
                      </div>
                      <p className="text-red-50 text-3xl font-bold">0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="bg-gradient-to-r from-zinc-900 to-neutral-900 rounded-lg p-6 shadow-lg mb-8 relative overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-[1px] bg-black/10 flex items-center justify-center z-10">
              <div className="text-center bg-white/5 backdrop-blur-lg rounded-lg p-6 shadow-xl max-w-md border border-white/30">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-white mb-2">Sign In to Track Your Orders</h3>
                <p className="text-white/80 mb-4">
                  Create an account or sign in to view your order history, track deliveries, and manage your purchases.
                </p>
                <div className="flex gap-3 justify-center">
                  <a
                    href="/login"
                    className="px-6 py-2 bg-white text-zinc-900 rounded-lg hover:bg-white/90 transition font-semibold"
                  >
                    Sign In
                  </a>
                  <a
                    href="/register"
                    className="px-6 py-2 border-2 border-white text-white rounded-lg hover:bg-white/10 transition font-semibold"
                  >
                    Register
                  </a>
                </div>
              </div>
            </div>
            
            {/* Blurred background dashboard */}
            <div className="opacity-75">
              <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-3xl">🛍️</span>
                My Order Dashboard
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Orders */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white text-xl">🛒</span>
                    <p className="text-white/80 text-xs font-medium">Total Orders</p>
                  </div>
                  <p className="text-white text-3xl font-bold">69</p>
                </div>
                
                {/* Completed Orders */}
                <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4 border border-green-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-300 text-xl">✓</span>
                    <p className="text-green-100 text-xs font-medium">Completed</p>
                  </div>
                  <p className="text-green-50 text-3xl font-bold">58</p>
                  <p className="text-green-200 text-xs mt-1">₦72,500 spent</p>
                </div>
                
                {/* Pending Orders */}
                <div className="bg-amber-500/20 backdrop-blur-sm rounded-lg p-4 border border-amber-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-300 text-xl">⏳</span>
                    <p className="text-amber-100 text-xs font-medium">Pending</p>
                  </div>
                  <p className="text-amber-50 text-3xl font-bold">5</p>
                </div>
                
                {/* Cancelled Orders */}
                <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 border border-red-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-300 text-xl">✕</span>
                    <p className="text-red-100 text-xs font-medium">Cancelled</p>
                  </div>
                  <p className="text-red-50 text-3xl font-bold">3</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <HomeBanner 
          title={settings?.bannerTitle}
          subtitle={settings?.bannerSubtitle}
          discount={settings?.bannerDiscount}
          image={settings?.bannerImage}
          colors={settings?.bannerColors}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-8">
          {products.map((product: any) => {
            return <ProductCard data={product} key={product.id} />;
          })}
        </div>
      </Container>
    </div>
  );
}

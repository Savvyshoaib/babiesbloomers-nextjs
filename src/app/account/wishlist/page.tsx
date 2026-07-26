import { WishlistView } from "@/components/site/wishlist-view";

export default function AccountWishlistPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-fredoka text-[28px] font-semibold text-ink sm:text-[34px]">
          My Wishlist
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Products you&apos;ve saved for later.
        </p>
      </div>

      <WishlistView />
    </div>
  );
}

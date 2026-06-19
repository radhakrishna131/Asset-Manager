import { useState, useEffect, useCallback } from "react";

const WISHLIST_KEY = "affiliate_wishlist";

export function useWishlist() {
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse wishlist", e);
    }
  }, []);

  const toggleWishlist = useCallback((productId: number) => {
    setWishlist((prev) => {
      const isSaved = prev.includes(productId);
      const next = isSaved
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: number) => wishlist.includes(productId),
    [wishlist]
  );

  return { wishlist, toggleWishlist, isInWishlist };
}

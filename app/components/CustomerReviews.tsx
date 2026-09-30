import { getCachedReviews } from "../lib/products-cache";
import CustomerReviewsClient from "./CustomerReviewsClient";

export default async function CustomerReviews() {
  const reviews = await getCachedReviews();
  return <CustomerReviewsClient initialReviews={reviews} />;
}

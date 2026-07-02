from django.db.models import Count

from .models import Review


def approved_product_reviews(product):
    return (
        Review.objects.filter(
            product=product,
            status=Review.Status.APPROVED,
            deleted_at__isnull=True,
        )
        .select_related("user", "product", "order_item")
    )


def product_rating_summary(product):
    queryset = approved_product_reviews(product)
    distribution_rows = queryset.values("rating").annotate(count=Count("id"))
    distribution = {str(rating): 0 for rating in range(1, 6)}
    for row in distribution_rows:
        distribution[str(row["rating"])] = row["count"]

    return {
        "average_rating": round(float(product.average_rating or 0), 2),
        "reviews_count": product.approved_reviews_count,
        "rating_distribution": distribution,
    }

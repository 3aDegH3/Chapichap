from django.db import migrations


def backfill_product_gallery(apps, schema_editor):
    Product = apps.get_model("products", "Product")
    ProductImage = apps.get_model("products", "ProductImage")

    for product in Product.objects.exclude(image="").exclude(image__isnull=True).iterator():
        if not ProductImage.objects.filter(product_id=product.pk).exists():
            ProductImage.objects.create(
                product_id=product.pk,
                image=product.image.name,
                alt_text=product.title,
                is_primary=True,
                sort_order=0,
            )


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0007_product_discount_ends_at_product_discount_price_and_more"),
    ]

    operations = [
        migrations.RunPython(backfill_product_gallery, migrations.RunPython.noop),
    ]

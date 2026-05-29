import random
import uuid
import urllib.request

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify

from ...models import Category, ClothingItem, ItemImage, Tag


class Command(BaseCommand):
    help = 'Seed the database with realistic clothing marketplace items.'

    def handle(self, *args, **options):
        User = get_user_model()
        user, created = User.objects.get_or_create(
            email='marketplace-seed@localhost',
            defaults={
                'username': 'marketplace_seed',
                'first_name': 'Marketplace',
                'last_name': 'Seed',
                'is_active': True,
            },
        )
        if created:
            user.set_password('seedpassword')
            user.save()
            self.stdout.write(self.style.SUCCESS('Created seed owner user marketplace-seed@localhost'))
        else:
            self.stdout.write(self.style.WARNING('Seed owner user already exists'))

        category_names = ['Hoodies', 'Jackets', 'Sneakers', 'Jeans', 'Shirts', 'Streetwear']
        categories = {}
        for name in category_names:
            category, _ = Category.objects.get_or_create(name=name, slug=slugify(name))
            categories[name] = category

        tags = [
            'vintage', 'minimal', 'streetwear', 'athleisure', 'retro', 'limited',
            'denim', 'everyday', 'utility', 'bold', 'soft', 'statement', 'grunge', 'clean', 'premium',
        ]
        tag_objects = {}
        for name in tags:
            tag, _ = Tag.objects.get_or_create(name=name)
            tag_objects[name] = tag

        image_sources = [
            'https://images.pexels.com/photos/6551385/pexels-photo-6551385.jpeg?cs=srgb&dl=pexels-andres-ayrton-6551385.jpg&fm=jpg',
            'https://images.pexels.com/photos/7236120/pexels-photo-7236120.jpeg?cs=srgb&dl=pexels-cottonbro-7236120.jpg&fm=jpg',
            'https://images.pexels.com/photos/977391/pexels-photo-977391.jpeg?cs=srgb&dl=pexels-minan1398-977391.jpg&fm=jpg',
            'https://images.pexels.com/photos/35145903/pexels-photo-35145903.jpeg?cs=srgb&dl=pexels-anton-nekhaychik_phtgrph-2151754498-35145903.jpg&fm=jpg',
            'https://images.pexels.com/photos/11344358/pexels-photo-11344358.jpeg?cs=srgb&dl=pexels-hurrahsuhail-11344358.jpg&fm=jpg',
            'https://images.pexels.com/photos/30750963/pexels-photo-30750963.jpeg?cs=srgb&dl=pexels-bymuratisikofficial-30750963.jpg&fm=jpg',
            'https://images.pexels.com/photos/7879998/pexels-photo-7879998.jpeg?cs=srgb&dl=pexels-mart-production-7879998.jpg&fm=jpg',
            'https://images.pexels.com/photos/5560288/pexels-photo-5560288.jpeg?cs=srgb&dl=pexels-tima-miroshnichenko-5560288.jpg&fm=jpg',
            'https://images.pexels.com/photos/3375910/pexels-photo-3375910.jpeg?cs=srgb&dl=pexels-technobulka-3375910.jpg&fm=jpg',
            'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg?cs=srgb&dl=pexels-zaktech90-1027130.jpg&fm=jpg',
            'https://images.pexels.com/photos/5037306/pexels-photo-5037306.jpeg?cs=srgb&dl=pexels-ketut-subiyanto-5037306.jpg&fm=jpg',
            'https://images.pexels.com/photos/8117154/pexels-photo-8117154.jpeg?cs=srgb&dl=pexels-aedrian-8117154.jpg&fm=jpg',
            'https://images.pexels.com/photos/36158507/pexels-photo-36158507.jpeg?cs=srgb&dl=pexels-prem-gs-3404648-36158507.jpg&fm=jpg',
            'https://images.pexels.com/photos/2244951/pexels-photo-2244951.jpeg?cs=srgb&dl=pexels-harsh-raj-gond-218020-2244951.jpg&fm=jpg',
            'https://images.pexels.com/photos/5697197/pexels-photo-5697197.jpeg?cs=srgb&dl=pexels-andiravsanjani-5697197.jpg&fm=jpg',
        ]

        fallback_image_url = 'https://images.pexels.com/photos/5697197/pexels-photo-5697197.jpeg?cs=srgb&dl=pexels-andiravsanjani-5697197.jpg&fm=jpg'

        items = [
            {
                'title': 'Sunset Fade Pullover Hoodie',
                'description': 'A soft cotton blend hoodie with subtle ombre dye and a relaxed fit. Great for layering and weekend streetwear looks.',
                'brand': 'Urban Trail',
                'category': categories['Hoodies'],
                'size': 'L',
                'condition': ClothingItem.CONDITION_LIKE_NEW,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'Los Angeles, CA',
                'tags': ['streetwear', 'soft', 'minimal'],
            },
            {
                'title': 'Nylon Packable Windbreaker Jacket',
                'description': 'Lightweight water-resistant jacket with hidden pockets and a modern cropped silhouette. Ideal for rainy city commutes.',
                'brand': 'Eastridge',
                'category': categories['Jackets'],
                'size': 'M',
                'condition': ClothingItem.CONDITION_GOOD,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'Portland, OR',
                'tags': ['utility', 'limited', 'athleisure'],
            },
            {
                'title': 'Classic White Canvas Sneakers',
                'description': 'Clean white low-top sneakers with grippy soles and reinforced stitching. Perfect for an everyday elevated look.',
                'brand': 'Apex',
                'category': categories['Sneakers'],
                'size': 'M',
                'condition': ClothingItem.CONDITION_NEW,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'Chicago, IL',
                'tags': ['everyday', 'minimal', 'premium'],
            },
            {
                'title': 'High-Rise Rigid Denim Jeans',
                'description': 'Structured straight-leg jeans in deep indigo denim with a flattering high rise. Perfect for clean, elevated outfits.',
                'brand': 'Foundry',
                'category': categories['Jeans'],
                'size': 'S',
                'condition': ClothingItem.CONDITION_GOOD,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'Austin, TX',
                'tags': ['denim', 'vintage', 'statement'],
            },
            {
                'title': 'Soft Chambray Button-Up Shirt',
                'description': 'Relaxed chambray shirt with mother-of-pearl buttons and a soft worn-in feel. Perfect for layering or easy styling.',
                'brand': 'Mercantile',
                'category': categories['Shirts'],
                'size': 'XL',
                'condition': ClothingItem.CONDITION_LIKE_NEW,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'New York, NY',
                'tags': ['clean', 'everyday', 'retro'],
            },
            {
                'title': 'Black Oversized Streetwear Tee',
                'description': 'Bold oversized T-shirt with contrast piping and a heavyweight cotton feel. Great as a statement layer with jeans or shorts.',
                'brand': 'Revolt Street',
                'category': categories['Streetwear'],
                'size': 'XXL',
                'condition': ClothingItem.CONDITION_GOOD,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'Brooklyn, NY',
                'tags': ['streetwear', 'bold', 'minimal'],
            },
            {
                'title': 'Vintage Graphic Hoodie',
                'description': 'Soft midweight hoodie featuring a retro logo print on the chest and a slightly faded finish for authentic vintage character.',
                'brand': 'Heritage',
                'category': categories['Hoodies'],
                'size': 'M',
                'condition': ClothingItem.CONDITION_FAIR,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'Seattle, WA',
                'tags': ['vintage', 'streetwear', 'soft'],
            },
            {
                'title': 'Quilted Overshirt Jacket',
                'description': 'Structured overshirt with quilted insulation and snap closures. Ideal for transitional weather and modern layering.',
                'brand': 'Forge',
                'category': categories['Jackets'],
                'size': 'L',
                'condition': ClothingItem.CONDITION_LIKE_NEW,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'Denver, CO',
                'tags': ['utility', 'premium', 'clean'],
            },
            {
                'title': 'Retro Running Sneakers',
                'description': 'A classic low-top runner with suede overlays and soft cushioning. A great pick for streetwear fans and sneaker collectors.',
                'brand': 'Stride',
                'category': categories['Sneakers'],
                'size': 'XL',
                'condition': ClothingItem.CONDITION_GOOD,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'Atlanta, GA',
                'tags': ['retro', 'streetwear', 'classic'],
            },
            {
                'title': 'Distressed Straight-Leg Jeans',
                'description': 'Medium wash denim with tasteful distressing and a relaxed straight fit. Built-in softness makes these jeans effortless.',
                'brand': 'Nord & Co',
                'category': categories['Jeans'],
                'size': 'M',
                'condition': ClothingItem.CONDITION_GOOD,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'San Francisco, CA',
                'tags': ['denim', 'vintage', 'everyday'],
            },
            {
                'title': 'Stripe Linen Button-Down Shirt',
                'description': 'Lightweight striped shirt in breathable linen blend. Ideal for warm days and relaxed weekend outfits.',
                'brand': 'Coastline',
                'category': categories['Shirts'],
                'size': 'S',
                'condition': ClothingItem.CONDITION_NEW,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'Miami, FL',
                'tags': ['minimal', 'premium', 'clean'],
            },
            {
                'title': 'Basketball-Inspired Streetwear Hoodie',
                'description': 'Bold oversized hoodie with team-inspired graphics and contrast trim. Designed for a statement streetwear look.',
                'brand': 'Varsity',
                'category': categories['Streetwear'],
                'size': 'L',
                'condition': ClothingItem.CONDITION_LIKE_NEW,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'Houston, TX',
                'tags': ['streetwear', 'bold', 'limited'],
            },
            {
                'title': 'Technical Shell Jacket',
                'description': 'Sleek shell jacket with taped seams, adjustable hood, and matte hardware. Designed for clean technical styling in cooler weather.',
                'brand': 'Terra',
                'category': categories['Jackets'],
                'size': 'M',
                'condition': ClothingItem.CONDITION_NEW,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'Vancouver, BC',
                'tags': ['utility', 'premium', 'minimal'],
            },
            {
                'title': 'Black Slim Denim Jeans',
                'description': 'Dark rinse slim jeans with a stretchy finish for all-day comfort. A modern staple that pairs well with both tees and tailoring.',
                'brand': 'Noir',
                'category': categories['Jeans'],
                'size': 'XL',
                'condition': ClothingItem.CONDITION_LIKE_NEW,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'Boston, MA',
                'tags': ['denim', 'clean', 'premium'],
            },
            {
                'title': 'Vintage Logo Crewneck Shirt',
                'description': 'Soft cotton crewneck with a retro logo print and a lived-in feel. Great for layering or a relaxed standalone look.',
                'brand': 'Archive',
                'category': categories['Shirts'],
                'size': 'M',
                'condition': ClothingItem.CONDITION_GOOD,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'Philadelphia, PA',
                'tags': ['vintage', 'streetwear', 'retro'],
            },
            {
                'title': 'Utility Cargo Streetwear Jacket',
                'description': 'Cargo-style jacket with oversized pockets and a structured fit. Perfect for adding rugged edge to modern streetwear outfits.',
                'brand': 'Forge',
                'category': categories['Streetwear'],
                'size': 'L',
                'condition': ClothingItem.CONDITION_GOOD,
                'status': ClothingItem.STATUS_AVAILABLE,
                'location': 'Phoenix, AZ',
                'tags': ['utility', 'bold', 'streetwear'],
            },
        ]

        for index, entry in enumerate(items):
            item, created = ClothingItem.objects.get_or_create(
                owner=user,
                title=entry['title'],
                defaults={
                    'description': entry['description'],
                    'brand': entry['brand'],
                    'category': entry['category'],
                    'size': entry['size'],
                    'condition': entry['condition'],
                    'status': entry['status'],
                    'location': entry['location'],
                },
            )
            if created:
                tag_instances = [tag_objects[name] for name in entry['tags'] if name in tag_objects]
                item.tags.set(tag_instances)
                item.save()
                self.stdout.write(self.style.SUCCESS(f'Created item: {item.title}'))
            else:
                self.stdout.write(self.style.WARNING(f'Item already exists: {item.title}'))

            if item.images.exists():
                for existing_image in list(item.images.all()):
                    existing_image.image.delete(save=False)
                    existing_image.delete()
                self.stdout.write(self.style.WARNING(f'Replaced existing images for item: {item.title}'))

            image_url = image_sources[index % len(image_sources)]
            try:
                request = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
                image_data = urllib.request.urlopen(request, timeout=15).read()
            except Exception as exc:
                self.stdout.write(self.style.WARNING(f'Failed to download image for {item.title}: {exc}. Trying fallback image.'))
                try:
                    fallback_request = urllib.request.Request(fallback_image_url, headers={'User-Agent': 'Mozilla/5.0'})
                    image_data = urllib.request.urlopen(fallback_request, timeout=15).read()
                except Exception as fallback_exc:
                    self.stdout.write(self.style.ERROR(f'Fallback image download failed for {item.title}: {fallback_exc}.'))
                    raise

            image_name = f'{uuid.uuid4().hex}.jpg'
            image_file = ContentFile(image_data, name=image_name)
            image = ItemImage(item=item, is_primary=True)
            image.image.save(image_name, image_file, save=True)
            self.stdout.write(self.style.SUCCESS(f'Attached image to item: {item.title}'))

        self.stdout.write(self.style.SUCCESS('Finished seeding clothing marketplace records.'))

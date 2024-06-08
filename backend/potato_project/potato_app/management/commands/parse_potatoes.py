import asyncio
from django.core.management.base import BaseCommand
from potato_app.parser import parser  # Импортируйте ваш скрипт парсера

class Command(BaseCommand):
    help = 'Парсинг данных о сортах картофеля и сохранение их в базе данных'

    def handle(self, *args, **kwargs):
        asyncio.run(parser())

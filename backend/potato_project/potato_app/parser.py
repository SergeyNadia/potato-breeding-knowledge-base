import requests
from bs4 import BeautifulSoup
import re
import os
import django
import asyncio
import aiohttp
from asgiref.sync import sync_to_async

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'potato_project.settings')
django.setup()

from potato_app.models import PotatoVariety

HOST = "https://gossortrf.ru/"
URL = "https://gossortrf.ru/registry/gosudarstvennyy-reestr-selektsionnykh-dostizheniy-dopushchennykh-k-ispolzovaniyu-tom-1-sorta-rasteni/?arrFilter_pf%5BCULTURE_NAME%5D=Картофель&arrFilter_pf%5BSORT_NAME%5D=&arrFilter_pf%5BSORT_ID%5D=&arrFilter_pf%5BALLOW_SUBJECTS_NAME%5D=&arrFilter_pf%5BALLOW_ORIGINATORS_NAME%5D=&set_filter=Y"
HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 YaBrowser/24.1.0.0 Safari/537.36"
}

def fetch_html(url, params=None):
    response = requests.get(url, headers=HEADERS, params=params)
    return response.text

def get_variety_details(variety_url):
    html = fetch_html(variety_url)
    soup = BeautifulSoup(html, 'html.parser')
    details = {
        'description': '',
        'characteristics': ''
    }

    list_items = soup.find_all('li')
    for item in list_items:
        if "Описание:" in item.text:
            details['description'] = item.text.replace("Описание:", "").strip()
        elif "Характеристики:" in item.text:
            characteristics_raw = item.decode_contents().split('<br>')
            characteristics = []
            for characteristic in characteristics_raw:
                if "</li>" in characteristic:
                    break
                characteristic_cleaned = re.sub('<[^<]+?>', '', characteristic).strip()
                if characteristic_cleaned:
                    characteristics.append(characteristic_cleaned)
            details['characteristics'] = "\n".join(characteristics).strip()

    return details

async def fetch_html_async(session, url, params=None):
    async with session.get(url, headers=HEADERS, params=params) as response:
        return await response.text()

async def get_content(session, html):
    soup = BeautifulSoup(html, 'html.parser')
    items = soup.find_all('li', id=True)

    for item in items:
        try:
            name = item.find('span', class_='results__name').get_text()
        except AttributeError:
            continue

        patent_element = item.find('span', class_='results__patent')
        patent_number = patent_element.get_text() if patent_element else None
        variety_link = HOST + item.find('a').get('href')
        details = get_variety_details(variety_link)

        year_text = item.find('span', class_='results__allow').get_text(strip=True).split(': ')[1].strip()
        year = re.sub(r'\D', '', year_text)  # Удаляем все нецифровые символы

        variety_data = {
            'name': name,
            'year': year,
            'link': variety_link,
            'patent_number': patent_number,
            'description': details['description'],
            'characteristics': details['characteristics']
        }

        # Выводим информацию о текущем объекте
        print(f"Название: {name}")
        print(f"Год включения: {year}")
        print(f"Ссылка: {variety_link}")
        print(f"Патент: {patent_number}")
        print(f"Описание: {details['description']}")
        print(f"Характеристики: {details['characteristics']}")
        print("-" * 40)

        await save_variety(variety_data)

@sync_to_async
def save_variety(variety_data):
    variety = PotatoVariety(**variety_data)
    variety.save()

async def parser():
    async with aiohttp.ClientSession() as session:
        tasks = []
        for page in range(1, 27):
            page_url = URL + f'&PAGEN_1={page}'
            tasks.append(asyncio.ensure_future(fetch_html_async(session, page_url)))

        pages_content = await asyncio.gather(*tasks)

        for page_content in pages_content:
            await get_content(session, page_content)

        print("Парсинг завершен успешно.")

if __name__ == "__main__":
    asyncio.run(parser())

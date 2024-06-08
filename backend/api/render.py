from django.shortcuts import render
from .models import WeatherData
from .forms import ReportForm


def generate_report(request):
    if request.method == 'POST':
        form = ReportForm(request.POST)
        if form.is_valid():
            start_date = form.cleaned_data['start_date']
            end_date = form.cleaned_data['end_date']
            location = form.cleaned_data.get('location')

            # Фильтрация данных на основе параметров
            queryset = WeatherData.objects.filter(date__range=[start_date, end_date])
            if location:
                queryset = queryset.filter(location=location)

            # Генерация отчета (например, в виде таблицы)
            return render(request, 'report.html', {'data': queryset, 'form': form})
    else:
        form = ReportForm()

    return render(request, 'report.html', {'form': form})

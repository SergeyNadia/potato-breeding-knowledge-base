from rest_framework import viewsets, status, filters
import random
from rest_framework.decorators import action
from django.shortcuts import render
from rest_framework.response import Response
from .models import FieldTrial, WeatherData, StorageCondition, CultivationTechnique, PlantProtection, PotatoVariety
from .serializers import FieldTrialSerializer, WeatherDataSerializer, StorageConditionSerializer, CultivationTechniqueSerializer, PlantProtectionSerializer, PotatoVarietySerializer
from .forms import ReportForm
from django.http import HttpResponse
from django.views import View
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.offline import plot
import io
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend


class WeatherDataViewSet(viewsets.ModelViewSet):
    queryset = WeatherData.objects.all()
    serializer_class = WeatherDataSerializer


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PotatoVarietyViewSet(viewsets.ModelViewSet):
    queryset = PotatoVariety.objects.all()
    serializer_class = PotatoVarietySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'year', 'patent_number', 'description']  # Добавлено поле description
    search_fields = ['name', 'year', 'patent_number', 'description']     # Добавлено поле description
    ordering_fields = ['name', 'year', 'patent_number', 'description']   # Добавлено поле description
    pagination_class = StandardResultsSetPagination

    @action(detail=False, methods=['get'])
    def random(self, request):
        count = PotatoVariety.objects.count()
        random_indices = list(set(random.sample(range(count), 3)))
        random_varieties = PotatoVariety.objects.filter(id__in=random_indices)
        serializer = self.get_serializer(random_varieties, many=True)
        return Response(serializer.data)


class FieldTrialViewSet(viewsets.ModelViewSet):
    queryset = FieldTrial.objects.all()
    serializer_class = FieldTrialSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['location', 'variety__name']
    search_fields = ['location', 'variety__name']
    ordering_fields = ['date', 'location', 'variety__name']
    pagination_class = StandardResultsSetPagination


class StorageConditionViewSet(viewsets.ModelViewSet):
    queryset = StorageCondition.objects.all()
    serializer_class = StorageConditionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['variety__name']
    search_fields = ['variety__name']
    ordering_fields = ['start_date', 'end_date', 'variety__name']
    pagination_class = StandardResultsSetPagination

class CultivationTechniqueViewSet(viewsets.ModelViewSet):
    queryset = CultivationTechnique.objects.all()
    serializer_class = CultivationTechniqueSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['variety__name', 'technique', 'application_date']
    search_fields = ['variety__name', 'technique', 'application_date']
    ordering_fields = ['variety__name', 'technique', 'application_date']
    pagination_class = StandardResultsSetPagination

class PlantProtectionViewSet(viewsets.ModelViewSet):
    queryset = PlantProtection.objects.all()
    serializer_class = PlantProtectionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['variety__name', 'pests', 'application_date']
    search_fields = ['variety__name', 'pests', 'application_date']
    ordering_fields = ['variety__name', 'pests', 'application_date']
    pagination_class = StandardResultsSetPagination



class ReportView(View):
    template_name = 'report.html'

    def get(self, request):
        form = ReportForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = ReportForm(request.POST)
        if form.is_valid():
            start_date = form.cleaned_data['start_date']
            end_date = form.cleaned_data['end_date']
            location = form.cleaned_data['location']

            reports = WeatherData.objects.filter(date__range=(start_date, end_date))
            if location:
                reports = reports.filter(location__icontains=location)

            # Generate report data
            data = pd.DataFrame(list(reports.values()))

            # Plotly graph for temperature variation
            temp_fig = px.line(data, x='date', y='temperature', title='Temperature Variation')
            temp_div = plot(temp_fig, output_type='div')

            # Count of wet and dry days
            wet_days = len(data[data['precipitation'] > 0])
            dry_days = len(data[data['precipitation'] == 0])

            # Critical temperature points
            max_temp = data['temperature'].max()
            min_temp = data['temperature'].min()

            # Plotly graph for wet and dry days
            wet_dry_fig = go.Figure(data=[
                go.Bar(name='Wet Days', x=['Days'], y=[wet_days]),
                go.Bar(name='Dry Days', x=['Days'], y=[dry_days])
            ])
            wet_dry_fig.update_layout(barmode='group', title_text='Wet and Dry Days')
            wet_dry_div = plot(wet_dry_fig, output_type='div')

            context = {
                'form': form,
                'reports': reports,
                'temp_div': temp_div,
                'wet_dry_div': wet_dry_div,
                'max_temp': max_temp,
                'min_temp': min_temp,
                'wet_days': wet_days,
                'dry_days': dry_days
            }
            return render(request, self.template_name, context)
        return render(request, self.template_name, {'form': form})

    def generate_csv(self, data):
        buffer = io.StringIO()
        data.to_csv(buffer)
        buffer.seek(0)
        return buffer

    def download_csv(self, request):
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        location = request.GET.get('location')

        reports = WeatherData.objects.filter(date__range=(start_date, end_date))
        if location:
            reports = reports.filter(location__icontains=location)

        data = pd.DataFrame(list(reports.values()))
        buffer = self.generate_csv(data)

        response = HttpResponse(buffer, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="weather_report_{start_date}_to_{end_date}.csv"'
        return response
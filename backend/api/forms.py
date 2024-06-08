from django import forms
from .models import PotatoVariety, FieldTrial, WeatherData

class PotatoVarietyForm(forms.ModelForm):
    class Meta:
        model = PotatoVariety
        fields = ['name', 'year', 'link', 'patent_number', 'description', 'characteristics']  # Убедитесь, что здесь нет поля 'properties'

class FieldTrialForm(forms.ModelForm):
    class Meta:
        model = FieldTrial
        fields = ['variety', 'date', 'location', 'conditions', 'results']

class WeatherDataForm(forms.ModelForm):
    class Meta:
        model = WeatherData
        fields = ['date', 'temperature', 'humidity', 'precipitation', 'location']

class ReportForm(forms.Form):
    start_date = forms.DateField(widget=forms.SelectDateWidget)
    end_date = forms.DateField(widget=forms.SelectDateWidget)
    location = forms.CharField(max_length=100, required=False)
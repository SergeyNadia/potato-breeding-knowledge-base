# models.py
from django.db import models
import pytz
from datetime import datetime

class WeatherData(models.Model):
    date = models.DateTimeField()
    temperature = models.FloatField()
    humidity = models.FloatField()
    precipitation = models.FloatField()
    location = models.CharField(max_length=100)

    def save(self, *args, **kwargs):
        if self.date.tzinfo is None:
            self.date = pytz.utc.localize(self.date)
        self.date = self.date.astimezone(pytz.utc)
        super().save(*args, **kwargs)

    def get_date_only(self):
        if self.date.tzinfo is None:
            return self.date
        return self.date.astimezone(pytz.utc).date()

    def __str__(self):
        return f"{self.date} - {self.location}"

    class Meta:
        db_table = 'api_weatherdata'
        managed = False


class PotatoVariety(models.Model):
    name = models.CharField(max_length=255)
    year = models.IntegerField()
    link = models.URLField()
    patent_number = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    characteristics = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'api_potatovariety'
        managed = False


class Report(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    parameters = models.JSONField()

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'api_report'
        managed = False


class FieldTrial(models.Model):
    date = models.DateField()
    location = models.CharField(max_length=255)
    conditions = models.TextField()
    results = models.TextField()
    variety = models.ForeignKey(PotatoVariety, on_delete=models.CASCADE)

class CultivationTechnique(models.Model):
    variety = models.ForeignKey(PotatoVariety, on_delete=models.CASCADE)
    technique = models.CharField(max_length=255)
    application_date = models.DateField()
    results = models.TextField()


class PlantProtection(models.Model):
    variety = models.ForeignKey(PotatoVariety, on_delete=models.CASCADE)
    pests = models.CharField(max_length=255)
    biological_measures = models.TextField()
    application_date = models.DateField()
    results = models.TextField()

    def __str__(self):
        return f"{self.variety.name} - {self.pests}"


class StorageCondition(models.Model):
    variety = models.ForeignKey(PotatoVariety, on_delete=models.CASCADE)
    temperature = models.FloatField()
    humidity = models.FloatField()
    start_date = models.DateField()
    end_date = models.DateField()
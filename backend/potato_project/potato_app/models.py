from django.db import models

class PotatoVariety(models.Model):
    name = models.CharField(max_length=200)
    year = models.IntegerField()
    link = models.URLField()
    patent_number = models.CharField(max_length=200, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    characteristics = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'dbo.potato_app_potatovariety'
        managed = False

class Variety(models.Model):
    name = models.CharField(max_length=200)

    class Meta:
        db_table = 'api_variety'
        managed = False

# Добавьте другие модели аналогичным образом

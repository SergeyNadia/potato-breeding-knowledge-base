from rest_framework import serializers
from .models import FieldTrial, WeatherData, StorageCondition, CultivationTechnique, PlantProtection, PotatoVariety


class WeatherDataSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")

    class Meta:
        model = WeatherData
        fields = '__all__'


class PotatoVarietySerializer(serializers.ModelSerializer):
    class Meta:
        model = PotatoVariety
        fields = '__all__'

class FieldTrialSerializer(serializers.ModelSerializer):
    variety = serializers.SlugRelatedField(
        queryset=PotatoVariety.objects.all(),
        slug_field='name'
    )

    class Meta:
        model = FieldTrial
        fields = ['id', 'date', 'location', 'conditions', 'results', 'variety']


class StorageConditionSerializer(serializers.ModelSerializer):
    variety = serializers.SlugRelatedField(
        queryset=PotatoVariety.objects.all(),
        slug_field='name'
    )

    class Meta:
        model = StorageCondition
        fields = ['id', 'variety', 'temperature', 'humidity', 'start_date', 'end_date']


class CultivationTechniqueSerializer(serializers.ModelSerializer):
    variety = serializers.SlugRelatedField(
        queryset=PotatoVariety.objects.all(),
        slug_field='name'
    )

    class Meta:
        model = CultivationTechnique
        fields = ['id', 'variety', 'technique', 'application_date', 'results']



class PlantProtectionSerializer(serializers.ModelSerializer):
    variety = PotatoVarietySerializer()

    class Meta:
        model = PlantProtection
        fields = ['id', 'variety', 'pests', 'biological_measures', 'application_date', 'results']
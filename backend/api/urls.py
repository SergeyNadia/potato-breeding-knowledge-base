from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'fieldtrials', views.FieldTrialViewSet)
router.register(r'weatherdata', views.WeatherDataViewSet)
router.register(r'storageconditions', views.StorageConditionViewSet)
router.register(r'cultivationtechniques', views.CultivationTechniqueViewSet)
router.register(r'plantprotections', views.PlantProtectionViewSet)
router.register(r'potato-varieties', views.PotatoVarietyViewSet, basename='potato-variety')

urlpatterns = [
    path('', include(router.urls)),
    path('potato-varieties/random/', views.PotatoVarietyViewSet.as_view({'get': 'random'}), name='potato-varieties-random'),
    path('report/', views.ReportView.as_view(), name='report'),
    ]

from django.db import models


class Recommendation(models.Model):
    score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Recommendation'
        verbose_name_plural = 'Recommendations'

    def __str__(self):
        return f'Recommendation {self.id} ({self.score})'

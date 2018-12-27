from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
class User(AbstractUser):
    mobile = models.CharField(max_length=11,unique=True,verbose_name='手机号')
    email_active=models.BooleanField(default=False,verbose_name='邮件激活状态')
    address = models.CharField(max_length=200,null=True,verbose_name='地址')
    class Meta:
        db_table = 'tb_users'
        verbose_name = '用户'
        verbose_name_plural = verbose_name

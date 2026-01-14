from datetime import timedelta

from django.db import transaction
from rest_framework.exceptions import ValidationError

from restaurant.models import Category, Dish, User, Tag, Review, Like, OrderDetail, Order, Table
from rest_framework import serializers

class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            data['image'] = instance.image.url
        return data


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'name', 'capacity', 'active']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields =['id', 'name']

class DishSerializer(ItemSerializer):
    class Meta:
        model = Dish
        fields = ['id', 'name', 'price', 'description' ,'image' ,'category', 'created_date', 'active', 'ingredients', 'preparation_time', 'tags']

class DishDetailSerializer(DishSerializer):
    tags = TagSerializer(many=True)
    class Meta:
        model = Dish
        fields = DishSerializer.Meta.fields + ['description','ingredients' , 'tags']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'avatar', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'required': False}
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar.url

        return data

    def update(self, instance, validated_data):
        keys = set(validated_data.keys())
        if keys - {'first_name', 'last_name'}:
            raise ValidationError({'error': 'Invalid fields'})

        return super().update(instance, validated_data)

    def create(self, validated_data):
        role = validated_data.get('role', User.Role.CUSTOMER)

        password = validated_data.pop('password', None)

        instance = self.Meta.model(**validated_data)

        if password is not None:
            instance.set_password(password)

        if role == User.Role.CHEF:
            instance.is_active = False
            instance.role = User.Role.CHEF
        else:
            instance.is_active = True
            instance.role = User.Role.CUSTOMER

        instance.save()
        return instance

class ReviewSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['user'] = UserSerializer(instance.user).data

        return data

    class Meta:
        model = Review
        fields = ['id', 'content', 'rating', 'created_date', 'user', 'dish']
        extra_kwargs = {
            'dish':{
                'write_only': True,
            }
        }

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'user', 'dish']

class OrderDetailSerializer(serializers.ModelSerializer):
    dish_name = serializers.CharField(source='dish.name', read_only=True)
    dish_image = serializers.ImageField(source='dish.image', read_only=True)

    class Meta:
        model = OrderDetail
        fields = ['id', 'dish', 'dish_name', 'dish_image', 'quantity', 'unit_price']
        extra_kwargs = {
            'unit_price': {'read_only': True}
        }


class OrderSerializer(serializers.ModelSerializer):

    items = OrderDetailSerializer(many=True, write_only=True, source='details',
                                  required=False)
    details = OrderDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'table', 'checkin_time', 'num_guests', 'payment_method', 'status', 'total_amount',
                  'created_date', 'items', 'details']
        read_only_fields = ['total_amount', 'status', 'created_date', 'user']

    def validate(self, attrs):
        table = attrs.get('table')
        checkin_time = attrs.get('checkin_time')

        if self.instance:
            table = table or self.instance.table
            checkin_time = checkin_time or self.instance.checkin_time

        if table and checkin_time:
            start_time = checkin_time - timedelta(hours=2)
            end_time = checkin_time + timedelta(hours=2)
            duplicate_orders = Order.objects.filter(
                table=table,
                status__in=['PENDING', 'CONFIRMED', 'SEATED'],
                checkin_time__range=(start_time, end_time)
            )

            if self.instance:
                duplicate_orders = duplicate_orders.exclude(pk=self.instance.pk)

            if duplicate_orders.exists():
                raise serializers.ValidationError(
                    {"table": f"Bàn {table.name} đã có người đặt vào khung giờ này (hoặc lân cận 2h)."}
                )

        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop('details')
        user = self.context['request'].user

        with transaction.atomic():
            order = Order.objects.create(user=user, **validated_data)
            total = 0

            for item in items_data:
                dish = item['dish']
                quantity = item['quantity']
                price = dish.price
                total += price * quantity

                OrderDetail.objects.create(
                    order=order,
                    dish=dish,
                    quantity=quantity,
                    unit_price=price
                )

            order.total_amount = total
            order.save()

        return order

    def update(self, instance, validated_data):
        # Lấy danh sách món mới gọi thêm (nếu có)
        items_data = validated_data.pop('details', None)

        with transaction.atomic():
            # 1. Cập nhật các thông tin cơ bản khác (bàn, số khách...) nếu có gửi kèm
            instance = super().update(instance, validated_data)

            if items_data is not None:
                # 2. Lấy tổng tiền hiện có của đơn hàng để cộng dồn tiếp
                total = instance.total_amount or 0

                for item in items_data:
                    dish = item['dish']
                    quantity = item['quantity']
                    price = dish.price

                    # Tính tiền cho phần món gọi thêm
                    total += price * quantity

                    # 3. Tạo chi tiết món mới (OrderDetail) mà KHÔNG xóa cái cũ
                    OrderDetail.objects.create(
                        order=instance,
                        dish=dish,
                        quantity=quantity,
                        unit_price=price
                    )

                # 4. Lưu tổng tiền mới sau khi đã cộng dồn các món gọi thêm
                instance.total_amount = total
                instance.save()

        return instance
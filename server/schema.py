from database.model_item_stats import ModelItemStats
from database.model_item_conditions import ModelItemConditions
from database.model_item import ModelItem
from database.model_set import ModelSet
from database.model_custom_set_stats import ModelCustomSetStats
from database.model_custom_set_exos import ModelCustomSetExos
from database.model_custom_set import ModelCustomSet
from database.model_user import ModelUser
from graphene_sqlalchemy import SQLAlchemyConnectionField, SQLAlchemyObjectType
from database import base
import graphene

class Item(SQLAlchemyObjectType):
    class Meta:
        model = ModelItem
        interfaces = (graphene.relay.Node,)

class ItemStats(SQLAlchemyObjectType):
    class Meta:
        model = ModelItemStats
        interfaces = (graphene.relay.Node,)

class ItemCondtions(SQLAlchemyObjectType):
    class Meta:
        model = ModelItemConditions
        interfaces = (graphene.relay.Node,)

class Set(SQLAlchemyObjectType):
    class Meta:
        model = ModelSet
        interfaces = (graphene.relay.Node,)

class CustomSet(SQLAlchemyObjectType):
    class Meta:
        model = ModelCustomSet
        interfaces = (graphene.relay.Node,)

class CustomSetStats(SQLAlchemyObjectType):
    class Meta:
        model = ModelCustomSetStats
        interfaces = (graphene.relay.Node,)

class CustomSetExos(SQLAlchemyObjectType):
    class Meta:
        model = ModelCustomSetExos
        interfaces = (graphene.relay.Node,)

class CustomSetStatsInput(graphene.InputObjectType):
    scrolled_vitality = graphene.Int()
    scrolled_wisdom = graphene.Int()
    scrolled_strength = graphene.Int()
    scrolled_intelligence = graphene.Int()
    scrolled_chance = graphene.Int()
    scrolled_agility = graphene.Int()

    base_vitality = graphene.Int()
    base_wisdom = graphene.Int()
    base_strength = graphene.Int()
    base_intelligence = graphene.Int()
    base_chance = graphene.Int()
    base_agility = graphene.Int()

class CustomSetExosInput(graphene.InputObjectType):
    stat = graphene.String()
    value = graphene.Int()

class CreateCustomSet(graphene.Mutation):
    class Arguments:
        name = graphene.String()
        description = graphene.String()
        owner_id = graphene.ID() # figure out to query current user
        created_at = graphene.types.datetime.DateTime()
        level = graphene.Int()

        items = graphene.List(graphene.String)
        stats = CustomSetStatsInput()
        exos = graphene.List(CustomSetExosInput)

    custom_set = graphene.Field(CustomSet)

    def mutate(self, into, **kwargs):
        custom_set = ModelCustomSet(
                        name=kwargs.get('name'),
                        description=kwargs.get('description'),
                        created_at=kwargs.get('created_at'),
                        level=kwargs.get('level'),
        )

        # Add associated items to the custom set
        # Modify to take in item objects
        if kwargs.get('items'):
            items = kwargs.get('items')
            for item in items:
                item_record = (
                    base.db_session.query(ModelItem)
                    .filter(ModelItem.name == item)
                    .first()
                )
                custom_set.items.append(item_record)

        # Create database entry for the stats then add to the custom set
        # discuss how exos will be implemented
        if kwargs.get('stats'):
            stats = kwargs.get('stats')
            custom_set_stats = ModelCustomSetStats(
                                    scrolled_vitality=stats.scrolled_vitality,
                                    scrolled_wisdom=stats.scrolled_wisdom,
                                    scrolled_strength=stats.scrolled_strength,
                                    scrolled_intelligence=stats.scrolled_intelligence,
                                    scrolled_chance=stats.scrolled_chance,
                                    scrolled_agility=stats.scrolled_agility,

                                    base_vitality=stats.base_vitality,
                                    base_wisdom = stats.base_wisdom,
                                    base_strength = stats.base_strength,
                                    base_intelligence = stats.base_intelligence,
                                    base_chance = stats.base_chance,
                                    base_agility = stats.base_agility
            )

            base.db_session.add(custom_set_stats)
            custom_set.stats = custom_set_stats
            base.db_session.commit()

        base.db_session.add(custom_set)
        base.db_session.commit()

        return CreateCustomSet(custom_set=custom_set)

# class UpdateCustomSet(graphene.Mutation):
#     pass

class User(SQLAlchemyObjectType):
    class Meta:
        model = ModelUser
        interfaces = (graphene.relay.Node,)

class CreateUser(graphene.Mutation):
    class Arguments:
        username = graphene.String()
        email = graphene.String()

    user = graphene.Field(User)

    def mutate(self, info, **kwargs):
        user = ModelUser(
                username=kwargs.get('username'),
                email=kwargs.get('email')
        )

        base.db_session.add(user)
        base.db_session.commit()

        return CreateUser(user=user)

class Query(graphene.ObjectType):
    # Get list of data
    items = graphene.List(Item)
    def resolve_items(self, info):
        query = Item.get_query(info)
        return query.all()

    custom_sets = graphene.List(CustomSet)
    def resolve_custom_sets(self, info):
        query = CustomSet.get_query(info)
        return query.all()

    # Retrieve record by uuid
    user_by_uuid = graphene.Field(User, uuid=graphene.String(required=True))
    def resolve_user_by_uuid(self, info, uuid):
        query = User.get_query(info)
        return query.filter(uuid==uuid).first()

    # also query for set and return it
    item_by_uuid = graphene.Field(Item, uuid=graphene.String(required=True))
    def resolve_item_by_uuid(self, info, uuid):
        query = Item.get_query(info)
        return query.filter(uuid==uuid).first()

    set_by_uuid = graphene.Field(Set, uuid=graphene.String(required=True))
    def resolve_set_by_uuid(self, info, uuid):
        query = Set.get_query(info)
        return query.filter(uuid==uuid).first()

    custom_set_by_uuid = graphene.Field(CustomSet, uuid=graphene.String(required=True))
    def resolve_custom_set_by_uuid(self, info, uuid):
        query = CustomSet.get_query(info)
        return query.filter(uuid==uuid).first()

    # Add resolver to query by item type

class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    create_custom_set = CreateCustomSet.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
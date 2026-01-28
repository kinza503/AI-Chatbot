# knowledge_base.py
from logic_engine import Predicate, Var

rules = [
    # initial facts
    (Predicate("capital_of", "pakistan", "islamabad"), []),
    (Predicate("capital_of", "japan", "tokyo"), []),
    (Predicate("capital_of", "france", "paris"), []),

    (Predicate("located_in", "islamabad", "asia"), []),
    (Predicate("located_in", "tokyo", "asia"), []),
    (Predicate("located_in", "paris", "europe"), []),

    # inference: continent_of(Country, Continent)
    (
        Predicate("continent_of", Var("Country"), Var("Continent")),
        [
            Predicate("capital_of", Var("Country"), Var("City")),
            Predicate("located_in", Var("City"), Var("Continent"))
        ]
    )
]


def add_fact(predicate_name, *args):
    rules.append((Predicate(predicate_name, *args), []))

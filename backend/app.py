import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from parse_nlp import parse_nlp

# -------------------------------------------------
# App setup
# -------------------------------------------------
app = Flask(__name__)
CORS(app)

# -------------------------------------------------
# Paths
# -------------------------------------------------
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
FACTS_FILE = os.path.join(DATA_DIR, "facts.txt")

# -------------------------------------------------
# Utilities
# -------------------------------------------------
def ensure_data():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(FACTS_FILE):
        open(FACTS_FILE, "w", encoding="utf-8").close()

# -------------------------------------------------
# Knowledge Base
# -------------------------------------------------
class KnowledgeBase:
    def __init__(self):
        ensure_data()
        self.facts = set()
        self.rules = []
        self.load_facts()
        self.load_rules()

    def load_facts(self):
        self.facts.clear()
        with open(FACTS_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip().lower()
                if not line or line.startswith("//") or line.startswith("\\"):
                    continue
                self.facts.add(tuple(line.split()))

    def load_rules(self):
        self.rules = [
            # parent(X,Y) & parent(Y,Z) → grandparent(X,Z)
            (
                ("grandparent", "X", "Z"),
                [("parent", "X", "Y"), ("parent", "Y", "Z")]
            )
        ]

    def add_fact(self, fact):
        if fact in self.facts:
            return False
        with open(FACTS_FILE, "a", encoding="utf-8") as f:
            f.write(" ".join(fact) + "\n")
        self.facts.add(fact)
        return True

KB = KnowledgeBase()

# -------------------------------------------------
# Logic Engine
# -------------------------------------------------
def is_var(x):
    return isinstance(x, str) and x[0].isupper()

def substitute(term, subs):
    return tuple([term[0]] + [subs.get(a, a) for a in term[1:]])

def unify(a, b, subs):
    if a[0] != b[0] or len(a) != len(b):
        return None
    subs = dict(subs)
    for x, y in zip(a[1:], b[1:]):
        x = subs.get(x, x)
        y = subs.get(y, y)
        if is_var(x):
            subs[x] = y
        elif is_var(y):
            subs[y] = x
        elif x != y:
            return None
    return subs

def prove(goal, subs, depth=0, max_depth=6):
    if depth > max_depth:
        return
    for fact in KB.facts:
        s = unify(goal, fact, subs)
        if s:
            yield s
    for head, body in KB.rules:
        s = unify(head, goal, subs)
        if not s:
            continue

        def prove_body(i, env):
            if i == len(body):
                yield env
                return
            g = substitute(body[i], env)
            for s2 in prove(g, env, depth + 1):
                yield from prove_body(i + 1, s2)

        yield from prove_body(0, s)

# -------------------------------------------------
# API Routes
# -------------------------------------------------
@app.route("/chat", methods=["POST"])
def chat():
    payload = request.get_json() or {}
    text = payload.get("message", "")

    parsed = parse_nlp(text)
    if not parsed:
        return jsonify({"answer": "I don't understand the question."})

    answers = []
    for s in prove(parsed, {}):
        inst = substitute(parsed, s)
        answers.append(inst)

    if not answers:
        return jsonify({"answer": "I don't have enough information."})

    if is_var(parsed[-1]):
        return jsonify({"answer": answers[0][-1]})

    return jsonify({"answer": answers})

@app.route("/add", methods=["POST"])
def add_fact():
    payload = request.get_json() or {}
    fact = payload.get("fact", "").lower().split()

    if len(fact) < 3:
        return jsonify({"error": "Invalid fact"}), 400

    added = KB.add_fact(tuple(fact))
    return jsonify({"added": added})

@app.route("/facts", methods=["GET"])
def facts():
    KB.load_facts()
    return jsonify(sorted(list(KB.facts)))

# -------------------------------------------------
# Run
# -------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)

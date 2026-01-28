# logic_engine.py
class Var:
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"Var({self.name})"


class Predicate:
    def __init__(self, name, *args):
        self.name = name
        self.args = args

    def __repr__(self):
        return f"{self.name}({', '.join(map(str, self.args))})"


def is_var(v):
    return isinstance(v, Var)


def unify(x, y, env):
    if env is None:
        return None

    if is_var(x):
        return unify_var(x, y, env)
    if is_var(y):
        return unify_var(y, x, env)

    if isinstance(x, Predicate) and isinstance(y, Predicate):
        if x.name != y.name or len(x.args) != len(y.args):
            return None
        for a, b in zip(x.args, y.args):
            env = unify(a, b, env)
            if env is None:
                return None
        return env

    return env if x == y else None


def unify_var(var, x, env):
    if var.name in env:
        return unify(env[var.name], x, env)

    if isinstance(x, Var) and x.name in env:
        return unify(var, env[x.name], env)

    env[var.name] = x
    return env


def substitute(expr, env):
    if is_var(expr):
        return env.get(expr.name, expr)

    if isinstance(expr, Predicate):
        return Predicate(expr.name, *[substitute(a, env) for a in expr.args])

    return expr


def backward_chain(goal, rules):
    for head, body in rules:
        env = unify(goal, head, {})
        if env is None:
            continue

        if not body:
            yield env
            continue

        def solve(i, e):
            if i == len(body):
                yield e
                return
            new_goal = substitute(body[i], e)
            for e2 in backward_chain(new_goal, rules):
                merged = {**e, **e2}
                yield from solve(i + 1, merged)

        yield from solve(0, env)

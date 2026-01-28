def parse_nlp(text):
    if not text:
        return None

    t = text.lower().strip().rstrip("?")

    # ---------------------------------
    # Remove filler words
    # ---------------------------------
    fillers = [
        "what is", "what's", "tell me", "give me",
        "can you", "please", "the"
    ]

    for f in fillers:
        t = t.replace(f, "")

    t = " ".join(t.split())

    # ---------------------------------
    # Keyword → predicate mapping
    # ---------------------------------
    keyword_map = {
        "atomic number": "atomic_number_of",
        "atomic weight": "atomic_weight_of",
        "symbol": "symbol_of",
        "capital": "capital_of",
        "currency": "currency_of",
        "continent": "continent_of",
        "calling code": "calling_code_of",
        "official language": "official_language_of",
        "electron configuration": "electron_configuration_of",
        "group": "group_of",
        "period": "period_of",
        "phase at room temp": "phase_at_room_temp_of",
        "phase": "phase_at_room_temp_of",
        "category": "category_of",
    }

    # ---------------------------------
    # Detect predicate and subject
    # ---------------------------------
    for key, predicate in keyword_map.items():
        if key in t:
            subject = t.replace(key, "")
            subject = subject.replace("of", "").strip()
            subject = subject.replace(" ", "_")
            return (predicate, subject, "X")

    return None

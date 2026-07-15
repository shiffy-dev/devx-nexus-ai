sessions = {}


def get_history(session_id):

    if session_id not in sessions:
        sessions[session_id] = []

    return sessions[session_id]


def add_message(session_id, role, content):

    history = get_history(session_id)

    history.append({
        "role": role,
        "content": content
    })

    # Keep only recent conversation
    if len(history) > 10:
        sessions[session_id] = history[-10:]
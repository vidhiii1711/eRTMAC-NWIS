from historical_intelligence import (
    find_historical_events,
    find_upcoming_events
)

from early_warning import (
    generate_early_warning
)

from gemini_service import (
    upload_documents,
    ask_historical_question
)


# ============================================================
# TEST DATA
# ============================================================

current_depth = 2850

nearby_well_ids = [
    "W001",
    "W002",
    "W003"
]


# These come from YOUR ML models
mud_loss_risk = 78.0
stuck_pipe_risk = 25.0
kick_risk = 12.0


# ============================================================
# HISTORICAL EVENTS
# ============================================================

upcoming_events = find_upcoming_events(

    current_depth=current_depth,

    nearby_well_ids=nearby_well_ids,

    lookahead=100
)


print("\n==============================")
print("UPCOMING HISTORICAL EVENTS")
print("==============================")

print(
    upcoming_events[
        [
            "Well_ID",
            "Depth_From",
            "Depth_To",
            "Formation",
            "Event_Type",
            "Distance_Ahead"
        ]
    ]
)


# ============================================================
# EARLY WARNING
# ============================================================

warning = generate_early_warning(

    mud_loss_risk=mud_loss_risk,

    stuck_pipe_risk=stuck_pipe_risk,

    kick_risk=kick_risk,

    historical_events=upcoming_events
)


print("\n==============================")
print("EARLY WARNING")
print("==============================")

print(
    "Level:",
    warning["level"]
)

for item in warning["warnings"]:

    print(
        "-",
        item["message"]
    )


# ============================================================
# UPLOAD WCR / DDR
# ============================================================

print("\n==============================")
print("UPLOADING DOCUMENTS")
print("==============================")


documents = upload_documents()


# ============================================================
# ASK GEMINI
# ============================================================

question = (
    "What happened around 2900 m "
    "and what did engineers do?"
    "in short"
)


answer = ask_historical_question(

    question=question,

    documents=documents,

    well_ids=nearby_well_ids
)


print("\n==============================")
print("GEMINI ANSWER")
print("==============================")

print(answer)
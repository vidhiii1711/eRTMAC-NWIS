import pandas as pd

from pathlib import Path

def load_historical_events():
    file_path = (
        Path(__file__).resolve().parent
        / "datasets"
        / "event_log.csv"
    )
    return pd.read_csv(file_path)

# find past well event
def find_historical_events(
    current_depth,
    nearby_well_ids,
    depth_window=100
):

    events = load_historical_events()

    # Keep only nearby wells , sirf zaruri wale well
    events = events[
        events["Well_ID"].isin(nearby_well_ids)
    ].copy()

    # Keep events around current depth
    events = events[
        (events["Depth_From"] >= current_depth - depth_window)
        &
        (events["Depth_From"] <= current_depth + depth_window)
    ].copy()

    # Distance from current depth
    events["Depth_Difference"] = (
        events["Depth_From"] - current_depth
    ).abs()

    return events.sort_values(
        "Depth_Difference"
    )

# find future well events
def find_upcoming_events(
    current_depth,
    nearby_well_ids,
    lookahead=100,
    formation=None
):

    events = load_historical_events()

    # Nearby wells only
    events = events[
        events["Well_ID"].isin(nearby_well_ids)
    ].copy()

    # Events ahead of current depth
    events = events[
        (events["Depth_From"] >= current_depth)
        &
        (
            events["Depth_From"]
            <= current_depth + lookahead
        )
    ].copy()

    # Optional formation matching
    if formation is not None:

        formation_events = events[
            events["Formation"].astype(str).str.lower()
            == str(formation).lower()
        ]

        # If formation matches exist,
        # prioritize those.
        if not formation_events.empty:
            events = formation_events

    # Distance ahead
    events["Distance_Ahead"] = (
        events["Depth_From"] - current_depth
    )

    return events.sort_values(
        "Distance_Ahead"
    )

def find_events_by_type(
    current_depth,
    nearby_well_ids,
    event_type,
    lookahead=100
):

    events = find_upcoming_events(
        current_depth=current_depth,
        nearby_well_ids=nearby_well_ids,
        lookahead=lookahead
    )

    events = events[
        events["Event_Type"].str.lower()
        == event_type.lower()
    ]

    return events
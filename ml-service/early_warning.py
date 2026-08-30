def generate_early_warning(
    mud_loss_risk,
    stuck_pipe_risk,
    kick_risk,
    historical_events
):

    warnings = []
    # comes from ml risk model
    if mud_loss_risk >= 70:

        warnings.append({
            "type": "ML",
            "event": "Mud Loss",
            "risk": round(mud_loss_risk, 2),
            "message": (
                f"High Mud Loss risk predicted "
                f"({mud_loss_risk:.1f}%)."
            )
        })

    elif mud_loss_risk >= 40:

        warnings.append({
            "type": "ML",
            "event": "Mud Loss",
            "risk": round(mud_loss_risk, 2),
            "message": (
                f"Medium Mud Loss risk predicted "
                f"({mud_loss_risk:.1f}%)."
            )
        })


    if stuck_pipe_risk >= 70:

        warnings.append({
            "type": "ML",
            "event": "Stuck Pipe",
            "risk": round(stuck_pipe_risk, 2),
            "message": (
                f"High Stuck Pipe risk predicted "
                f"({stuck_pipe_risk:.1f}%)."
            )
        })

    elif stuck_pipe_risk >= 40:

        warnings.append({
            "type": "ML",
            "event": "Stuck Pipe",
            "risk": round(stuck_pipe_risk, 2),
            "message": (
                f"Medium Stuck Pipe risk predicted "
                f"({stuck_pipe_risk:.1f}%)."
            )
        })


    if kick_risk >= 70:

        warnings.append({
            "type": "ML",
            "event": "Kick",
            "risk": round(kick_risk, 2),
            "message": (
                f"High Kick risk predicted "
                f"({kick_risk:.1f}%)."
            )
        })

    elif kick_risk >= 40:

        warnings.append({
            "type": "ML",
            "event": "Kick",
            "risk": round(kick_risk, 2),
            "message": (
                f"Medium Kick risk predicted "
                f"({kick_risk:.1f}%)."
            )
        })

    historical_warnings = []

    if not historical_events.empty:

        for _, event in historical_events.iterrows():

            historical_warnings.append({

                "well_id": event["Well_ID"],

                "depth": float(
                    event["Depth_From"]
                ),

                "event_type": event["Event_Type"],

                "formation": event["Formation"],

                "distance_ahead": float(
                    event["Distance_Ahead"]
                ),

                "severity": event["Severity"],

                "action": event["Mitigation"],

                "outcome": event["Outcome"]
            })


            warnings.append({
                "type": "HISTORICAL",

                "event": event["Event_Type"],

                "risk": None,

                "message": (
                    f"Historical {event['Event_Type']} "
                    f"event found at "
                    f"{event['Depth_From']} m, "
                    f"{event['Distance_Ahead']:.0f} m ahead "
                    f"in {event['Well_ID']}."
                )
            })

    high_ml_risk = (
        mud_loss_risk >= 70
        or
        stuck_pipe_risk >= 70
        or
        kick_risk >= 70
    )

    medium_ml_risk = (
        mud_loss_risk >= 40
        or
        stuck_pipe_risk >= 40
        or
        kick_risk >= 40
    )

    has_historical_warning = (
        not historical_events.empty
    )


    # HIGH:
    # High ML risk + historical event
    if (
        high_ml_risk
        and
        has_historical_warning
    ):

        overall_level = "HIGH"


    # HIGH:
    # High ML risk even without history
    elif high_ml_risk:

        overall_level = "HIGH"


    # MEDIUM:
    # Historical event ahead
    elif has_historical_warning:

        overall_level = "MEDIUM"


    # MEDIUM:
    # ML risk is moderate
    elif medium_ml_risk:

        overall_level = "MEDIUM"


    else:

        overall_level = "LOW"

    return {

        "level": overall_level,

        "warnings": warnings,

        "historical_events": historical_warnings
    }
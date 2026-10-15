# Jury Q&A — honest answers (read before the demo)

**Is this live data?**  Weather is live (Open-Meteo). Train position is simulated: Indian Railways' RTIS/COIS have no public API;
a pilot needs a CRIS/zonal-railway agreement. The UI says SIMULATED RTIS everywhere it matters.

**What exactly did you train?**  XGBoost quantile models (q10/q50/q90) on 1,463 real station rows from 88 trains (etrain.info 1-year
aggregate, Sep 2025). Target = typical delay at a station. Evaluated only on services the model never saw: MAE 21.0 vs 25.4 min baseline.

**Then why does moving the slider change the forecast?**  The slider is the live delay at the current stop (simulated input).
The model supplies how much extra delay a train of this class usually accumulates between stops; we propagate your delay with that.

**Is the P10–P90 range reliable?**  Partly. Measured coverage is 72% vs an 80% target, so it is a bit optimistic. We show that number in the UI.

**Where do TSR / preceding train / weather effects come from?**  Labelled assumptions (×0.4 spill-over, +10 min TSR, 10 min × severity).
The training data has no such signal, so we do not pretend the model learned them. They are applied as rules, and the UI marks them SIMULATED.

**Is the timetable correct?**  It comes from a public dump and is not NTES-verified; every train is flagged so. Verify before any real use.

**Why 88 trains / how does it scale?**  Those are the trains present in both datasets. Adding a train is data-only (rows + `build_data.py` + retrain);
the API, registry and UI are data-driven and stateless.

**What is next?**  RTIS access via a zonal pilot; a collector to build day-by-day history; row-level retraining with drift monitoring; a
section-level graph model; WebSocket push.

**What does it NOT do?**  It does not give a day-specific delay, a calibrated interval, or verified timetables. Duronto trains see no gain over the baseline.

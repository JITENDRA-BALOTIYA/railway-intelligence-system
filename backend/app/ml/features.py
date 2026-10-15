"""Shared feature builder: used by training AND serving so they cannot drift."""
CLASS_CODE = {"vande_bharat": 0, "rajdhani": 1, "shatabdi": 2, "duronto": 3, "mail": 4, "express": 5}
FEATURES = ["elapsed_min", "frac_time", "total_min", "class_code", "odd", "hour"]


def row(elapsed_min: float, total_min: float, train_class: str, train_no: int, hour: int) -> dict:
    return {
        "elapsed_min": float(elapsed_min),
        "frac_time": float(elapsed_min) / max(float(total_min), 1.0),
        "total_min": float(total_min),
        "class_code": CLASS_CODE.get(train_class, 5),
        "odd": int(train_no) % 2,       # odd/even train number = direction (convention, not guaranteed)
        "hour": int(hour),
    }

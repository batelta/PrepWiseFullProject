# run_analysis.py

import sys
import pandas as pd
import json
from model_logic import run_model_and_generate_output

# 1️⃣ לבדוק שיש קובץ שהועבר
if len(sys.argv) < 2:
    print(json.dumps({"error": "No CSV file path provided"}))
    sys.exit(1)

# 2️⃣ לקרוא את הקובץ
file_path = sys.argv[1]

try:
    df = pd.read_csv(file_path)

    # 3️⃣ להריץ את הפונקציה
    result = run_model_and_generate_output(df)

    # 4️⃣ להחזיר JSON
    print(json.dumps(result))
    sys.exit(0)  # ← חשוב מאוד!
except Exception as e:
    import traceback
    error_message = {
        "error": str(e),
        "trace": traceback.format_exc()
    }
    print(json.dumps(error_message))
    sys.exit(1)
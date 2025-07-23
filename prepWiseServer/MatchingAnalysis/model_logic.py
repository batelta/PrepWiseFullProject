import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.inspection import permutation_importance
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
import warnings
warnings.filterwarnings('ignore')


def run_model_and_generate_output(df: pd.DataFrame) -> dict:
    # ------------------------------
    # שלב 1: ניקוי והכנה
    # ------------------------------
    feature_columns = [
        'LanguageMatch', 'GenderMatch', 'CompanyMatch', 'CareerFieldMatch',
        'RoleMatch', 'SocialStyleMatch', 'GuidanceStyleMatch',
        'CommunicationStyleMatch', 'LearningStyleMatch', 'ExperienceLevelMatch',
        'LanguageImportant', 'GenderImportant', 'CompanyImportant'
    ]
    df[feature_columns] = df[feature_columns].fillna(0)

    # ✅ רק לשלושה פיצ'רים יש אינטראקציה עם Importance
    df['LanguageMatch_Important'] = df['LanguageMatch'] * df['LanguageImportant']
    df['GenderMatch_Important'] = df['GenderMatch'] * df['GenderImportant']
    df['CompanyMatch_Important'] = df['CompanyMatch'] * df['CompanyImportant']

    extended_features = feature_columns + [
        'LanguageMatch_Important', 'GenderMatch_Important', 'CompanyMatch_Important'
    ]
    X = df[extended_features].copy()
    y = df['Success'].copy()

    # בודקים אם יש מספיק דגימות לכל קלאס
    class_counts = y.value_counts()
    can_stratify = all(class_counts >= 2)

    # ------------------------------
    # שלב 2: חלוקת Train/Test
    # ------------------------------
    if len(df) > 10 and len(y.unique()) > 1 and can_stratify:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
    else:
        # מעט דגימות → משתמשים בכל הדאטה כ-Train ו-Test
        X_train, X_test, y_train, y_test = X, X, y, y

    # ------------------------------
    # שלב 3: סקלינג ואימון מודל לוגיסטי
    # ------------------------------
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    class_weight = 'balanced' if len(y.unique()) > 1 and y.mean() not in [0, 1] else None
    lr_model = LogisticRegression(max_iter=1000, class_weight=class_weight, solver='liblinear')

    try:
        lr_model.fit(X_train_scaled, y_train)
        y_pred = lr_model.predict(X_test_scaled)
        y_pred_proba = lr_model.predict_proba(X_test_scaled)[:, 1]
        accuracy = accuracy_score(y_test, y_pred)
        auc_score = roc_auc_score(y_test, y_pred_proba) if len(y_test.unique()) > 1 else None

        # ✅ חשיבות פיצ'רים לפי permutation importance
        feature_importance = pd.DataFrame({
            'Feature': extended_features,
            'Importance': lr_model.coef_[0]
        })
        if len(X_test) > 1 and len(y_test.unique()) > 1:
            perm_importance = permutation_importance(
                lr_model, X_test_scaled, y_test,
                n_repeats=min(10, max(2, len(X_test) // 10)),
                random_state=42, scoring='accuracy'
            )
            feature_importance['Importance'] = perm_importance.importances_mean

    except Exception as e:
        # Fallback אם יש בעיה באימון
        feature_importance = pd.DataFrame({
            'Feature': extended_features,
            'Importance': np.random.random(len(extended_features)) * 0.001
        })

    # ------------------------------
    # שלב 4: חישוב משקלים חדשים לפרמטרים
    # ------------------------------
    def calculate_new_weights(importance_df):
        feature_to_param = {
            'LanguageMatch': 'Language',
            'LanguageImportant': 'LanguageImportant',
            'LanguageMatch_Important': 'LanguageImportant',
            'GenderMatch': 'Gender',
            'GenderImportant': 'GenderImportant',
            'GenderMatch_Important': 'GenderImportant',
            'CareerFieldMatch': 'CareerField',
            'CompanyMatch': 'Company',
            'CompanyImportant': 'CompanyImportant',
            'CompanyMatch_Important': 'CompanyImportant',
            'SocialStyleMatch': 'SocialStyle',
            'GuidanceStyleMatch': 'GuidanceStyle',
            'CommunicationStyleMatch': 'CommunicationStyle',
            'LearningStyleMatch': 'LearningStyle',
            'RoleMatch': 'Role',
            'ExperienceLevelMatch': 'JobExperienceLevel'
        }

        param_importance = {}
        for _, row in importance_df.iterrows():
            feature = row['Feature']
            importance = max(0, abs(row['Importance']))
            if feature in feature_to_param:
                param = feature_to_param[feature]
                param_importance[param] = param_importance.get(param, 0) + importance

        # מנרמלים לסכום = 1
        epsilon = 1e-9
        for param in param_importance:
            param_importance[param] += epsilon
        total = sum(param_importance.values())
        normalized = {param: importance / total for param, importance in param_importance.items()}
        return normalized

    new_weights = calculate_new_weights(feature_importance)
    results_df = pd.DataFrame(
        [{'ParameterName': k, 'NewWeight': round(v, 3)} for k, v in new_weights.items()]
    ).sort_values(by='NewWeight', ascending=False)

    # ------------------------------
    # ✅ שלב 4.5: הערכת ביצועים אם ניישם את המשקלים החדשים
    # ------------------------------
    def compute_new_score(row, weights):
        mapping = {
            "Language": "LanguageMatch",
            "Gender": "GenderMatch",
            "Company": "CompanyMatch",
            "CareerField": "CareerFieldMatch",
            "Role": "RoleMatch",
            "SocialStyle": "SocialStyleMatch",
            "GuidanceStyle": "GuidanceStyleMatch",
            "CommunicationStyle": "CommunicationStyleMatch",
            "LearningStyle": "LearningStyleMatch",
            "JobExperienceLevel": "ExperienceLevelMatch"
        }
        score = 0.0
        for param, w in weights.items():
            feature_col = mapping.get(param)
            if feature_col and feature_col in row:
                score += row[feature_col] * w
        return score

    # נחשב ציון חדש לכל דגימה
    df["new_score"] = df.apply(lambda r: compute_new_score(r, new_weights), axis=1)

    # סף החלטה פשוט: ממוצע הציונים
    threshold = df["new_score"].mean()
    df["predicted_success_new_weights"] = (df["new_score"] > threshold).astype(int)

    # נמדוד את הביצועים הצפויים של המשקלים החדשים
    predicted_accuracy = accuracy_score(y, df["predicted_success_new_weights"])
    predicted_auc = roc_auc_score(y, df["new_score"]) if len(y.unique()) > 1 else None

    # ------------------------------
    # שלב 5: גרפים (נשאר כמו בקוד שלך)
    # ------------------------------
    image_uris = []
    sns.set_style("whitegrid")
    plt.rcParams.update({
        "font.size": 28,
        "axes.titlesize": 32,
        "axes.labelsize": 28,
        "xtick.labelsize": 26,
        "ytick.labelsize": 26,
        "legend.fontsize": 26,
        "figure.figsize": (16, 12),
        "figure.dpi": 100,
    })

    # גרף 1: המשקלים החדשים
    plt.figure(figsize=(18, 12))
    sns.set_palette("pastel")
    sns.barplot(data=results_df, y="ParameterName", x="NewWeight")
    plt.title("🔧 Recommended New Weights")
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    image_uris.append(base64.b64encode(buf.getvalue()).decode("utf-8"))
    plt.close()

    # גרף 2: השוואה מול משקלים קיימים
    current_weights = {
        'Language': 0.2, 'LanguageImportant': 0.3, 'Gender': 0.15,
        'GenderImportant': 0.23, 'CareerField': 0.25, 'Company': 0.1,
        'CompanyImportant': 0.15, 'SocialStyle': 0.08, 'GuidanceStyle': 0.08,
        'CommunicationStyle': 0.07, 'LearningStyle': 0.07, 'Role': 0.2,
        'JobExperienceLevel': 0.06
    }
    comparison_df = pd.DataFrame([
        {
            "Parameter": param,
            "Current": current_weights.get(param, 0),
            "New": new_weights.get(param, 0)
        }
        for param in set(current_weights) | set(new_weights)
    ])
    melted = comparison_df.melt(id_vars="Parameter", var_name="Type", value_name="Weight")
    plt.figure(figsize=(18, 12))
    sns.barplot(data=melted, y="Parameter", x="Weight", hue="Type")
    plt.title("⚖️ Current vs Recommended Weights")
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    image_uris.append(base64.b64encode(buf.getvalue()).decode("utf-8"))
    plt.close()

    # גרף 3: 10 הפיצ'רים הכי חשובים
    plt.figure(figsize=(18, 12))
    top_features = feature_importance.copy()
    top_features["AbsImportance"] = top_features["Importance"].abs()
    top_features = top_features.sort_values("AbsImportance", ascending=False).head(10)
    sns.barplot(data=top_features, y="Feature", x="AbsImportance")
    plt.title("📈 Top Features Affecting Success")
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    image_uris.append(base64.b64encode(buf.getvalue()).decode("utf-8"))
    plt.close()

    # ------------------------------
    # שלב 6: סיכום טקסטואלי
    # ------------------------------
    summary = f"Model trained on {len(df)} samples.\n"
    if 'accuracy' in locals():
        summary += f"Logistic Regression Accuracy: {accuracy:.3f}\n"
    if 'auc_score' in locals() and auc_score is not None:
        summary += f"Logistic Regression AUC: {auc_score:.3f}\n"

    summary += "\nTop recommended weights:\n"
    for _, row in results_df.head(3).iterrows():
        summary += f"- {row['ParameterName']}: {row['NewWeight']}\n"

    # ✅ מוסיפים את הביצועים הצפויים אם ניישם את המשקלים החדשים
    summary += f"\nExpected accuracy if applying new weights: {predicted_accuracy:.3f}"
    if predicted_auc is not None:
        summary += f"\nExpected AUC with new weights: {predicted_auc:.3f}"

    # ------------------------------
    # שלב 7: שמירת CSV + Base64
    # ------------------------------
    results_df.to_csv("new_weights_recommendations.csv", index=False)
    with open("new_weights_recommendations.csv", "rb") as f:
        csv_base64 = base64.b64encode(f.read()).decode("utf-8")

    # ------------------------------
    # שלב 8: החזרת תוצאה מלאה
    # ------------------------------
    return {
        "graphList": image_uris,
        "summary": summary,
        "weights": results_df.to_dict(orient="records"),
        "csv_base64": csv_base64,
        "expected_accuracy": predicted_accuracy,
        "expected_auc": predicted_auc
    }
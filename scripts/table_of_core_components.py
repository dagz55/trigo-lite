import pandas as pd
import ace_tools as tools

# Descriptions for each cost line
desc = {
    "Supabase": "Managed Postgres + Auth + Realtime (data store & login)",
    "Mapbox": "Map tiles, routing & geodata APIs for live tricycle tracking",
    "SMS_Twilio": "OTP / fallback SMS & masked calling via Twilio",
    "ServerInfra_GCP": "Cloud Run compute, CI/CD & egress on Google Cloud",
    "Customer_Support": "24×7 chat agents + GPT FAQ bot handling ride issues",
    "Marketing_Ads": "User‑acquisition spend: FB/IG/TikTok ads, voucher promos"
}

# Core numbers table (same as user provided)
base = {
    "Users": [10000, 20000, 30000, 40000],
    "Supabase": [69600, 139200, 208800, 278400],
    "Mapbox": [34800, 69600, 104400, 139200],
    "SMS_Twilio": [29000, 58000, 87000, 116000],
    "ServerInfra_GCP": [139200, 280400, 560800, 661600],
    "Customer_Support": [174000, 208800, 243600, 278400],
    "Marketing_Ads": [290000, 348000, 417600, 487200],
}

# Build long-form itemised dataframe
records = []
for idx, users in enumerate(base["Users"]):
    for key in desc.keys():
        records.append({
            "Users": users,
            "Item": key,
            "Description": desc[key],
            "Cost_PHP": base[key][idx]
        })

df_long = pd.DataFrame(records)

csv_path = "/mnt/data/TriGo_Cost_Itemised_with_Descriptions.csv"
df_long.to_csv(csv_path, index=False)

tools.display_dataframe_to_user("TriGo Itemised Costs with Descriptions Preview", df_long.head(18))


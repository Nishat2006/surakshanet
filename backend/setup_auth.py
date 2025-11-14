# setup_auth.py
from composio import ComposioToolSet

# Your API Key
COMPOSIO_API_KEY = "ak_bMIDkCtvAN6qqQdpQClk" 

# Initialize the toolset
toolset = ComposioToolSet(api_key=COMPOSIO_API_KEY)

# Get the default entity (user)
entity = toolset.get_entity(id="default") 

print("\n" + "="*50)
print(" 🔗 SURAKSHANET AUTHENTICATION SETUP")
print("="*50)

try:
    # 1. Generate Slack Connection Link
    print("\n1️⃣  Generating SLACK connection link...")
    slack_req = entity.initiate_connection(app_name="slack")
    print(f"👉 CLICK HERE TO CONNECT SLACK: {slack_req.redirectUrl}")

    # 2. Generate Gmail Connection Link
    print("\n2️⃣  Generating GMAIL connection link...")
    gmail_req = entity.initiate_connection(app_name="gmail")
    print(f"👉 CLICK HERE TO CONNECT GMAIL: {gmail_req.redirectUrl}")

    print("\n" + "="*50)
    print("✅ Instructions:")
    print("1. Ctrl+Click the links above.")
    print("2. Approve the permissions in your browser.")
    print("3. Once both say 'Connection Successful', restart app.py.")
    print("="*50)

except Exception as e:
    print(f"❌ Error generating links: {e}")
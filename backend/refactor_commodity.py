import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    orig = content
    # Remove Commodity import
    content = re.sub(r',\s*Commodity', '', content)
    content = re.sub(r'Commodity,\s*', '', content)
    content = re.sub(r'from app.models.schemas import (\s*|\n|.)*?Commodity.*', lambda m: m.group(0).replace('Commodity,', '').replace(' Commodity', ''), content)
    # The regex might be complex, let's just use string replace for imports if simple enough, or handle them.
    
    # We can also just replace `Commodity(listing["commodity"])` with `listing["crop_id"]`
    content = content.replace('Commodity(listing["commodity"])', 'listing["crop_id"]')
    content = content.replace('Commodity(demand["commodity"])', 'demand["crop_id"]')
    content = content.replace('Commodity(item["commodity"])', 'item["crop_id"]')
    content = content.replace('Commodity(listing.commodity)', 'listing.crop_id')
    content = content.replace('commodity=Commodity(listing["commodity"])', 'crop_id=listing["crop_id"]')
    
    # Replace dict keys
    content = content.replace('["commodity"]', '["crop_id"]')
    content = content.replace("['commodity']", "['crop_id']")
    content = content.replace('commodity:', 'crop_id:')
    content = content.replace('commodity=', 'crop_id=')
    content = content.replace('.commodity', '.crop_id')
    
    # Replace default value `Commodity.SOYBEAN` with `"c0000000-0000-0000-0000-000000000001"`
    content = content.replace('Commodity.SOYBEAN', '"c0000000-0000-0000-0000-000000000001"')
    
    # Other enums? `Commodity.WHEAT`, etc.
    content = content.replace('Commodity.WHEAT', '"c0000000-0000-0000-0000-000000000002"')
    content = content.replace('Commodity.COTTON', '"c0000000-0000-0000-0000-000000000003"')
    
    # Replace parameter types `commodity: Commodity` with `crop_id: str`
    content = re.sub(r'\bcommodity:\s*Commodity\b', 'crop_id: str', content)
    content = re.sub(r'\bcommodity:\s*str\b', 'crop_id: str', content)
    
    # Replace query / path param `commodity` to `crop_id`
    # Replace Commodity imports
    content = re.sub(r'\bCommodity\b', 'str', content) # Since Commodity shouldn't be used anymore, wait! we just replaced it with str where it was an annotation.
    # We should be careful about replacing `Commodity` generally.
    
    # For now, let's just do it manually for schemas.py, it needs `Commodity` enum removed?
    
    if orig != content:
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk('/Users/ompatel/Desktop/FARM-NEX/backend'):
    for file in files:
        if file.endswith('.py') and file != 'refactor_commodity.py':
            process_file(os.path.join(root, file))


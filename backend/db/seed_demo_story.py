import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import db
from datetime import datetime, date, timedelta

def seed_demo_story():
    """
    Seeds the exact demo storyline entities into the database:
    1. Farmer: Ramesh Patel (Indore, MP)
    2. 3 Verified Bulk Buyers:
       - Dewas Agrocorp (38 km, ₹4,900/Q, Rank #1 Net Realization)
       - Bhopal Solvex (190 km, ₹5,050/Q, High price but high freight)
       - Mahakal Feeds Ujjain (55 km, ₹4,750/Q)
    3. Community discussions with expert verification.
    """
    print("Re-seeding Farm-Nex demo storyline state...")
    db._seed_default_state()
    print("Demo state initialized successfully.")

if __name__ == "__main__":
    seed_demo_story()

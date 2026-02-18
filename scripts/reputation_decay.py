#!/usr/bin/env python3
"""
Reputation Decay Script for TheCommons v2.0

This script implements the "Reputation Shield" spark logic:
- Scout points decay at 10% per month
- Decay is prevented by contributing higher-tier Sparks (Designer/Builder)
- Tracks both Active CS (with decay) and Lifetime CS
- Integrates with Logarithmic Voting Power formula: Weight = log10(CS_active)

Usage:
    python reputation_decay.py --input contributors.json --output updated_cs.json
    python reputation_decay.py --simulate  # Run simulation mode
"""

import json
import argparse
from datetime import datetime, timedelta
from typing import Dict, List
from math import log10


class ContributorScore:
    """Represents a contributor's CS scores and contribution history"""
    
    def __init__(self, username: str, contributions: List[Dict] = None):
        self.username = username
        self.contributions = contributions or []
        self.lifetime_cs = 0
        self.active_cs = 0
        self.last_calculated = datetime.now()
        
    def calculate_scores(self, current_date: datetime = None) -> Dict:
        """Calculate lifetime and active CS with decay applied"""
        if current_date is None:
            current_date = datetime.now()
            
        self.lifetime_cs = 0
        self.active_cs = 0
        
        for contribution in self.contributions:
            contrib_date = datetime.fromisoformat(contribution['date'])
            role = contribution['role']
            cs_earned = contribution['cs']
            
            # Add to lifetime CS (never decays)
            self.lifetime_cs += cs_earned
            
            # Calculate active CS with decay for Scout contributions
            if role == 'scout':
                months_elapsed = self._months_between(contrib_date, current_date)
                
                # Check if user has higher-tier contributions after this Scout contribution
                has_higher_tier = self._has_higher_tier_after(contrib_date)
                
                if has_higher_tier:
                    # No decay if they contributed higher-tier Sparks
                    self.active_cs += cs_earned
                else:
                    # Apply 10% decay per month
                    decay_factor = 0.9 ** months_elapsed
                    self.active_cs += cs_earned * decay_factor
            else:
                # Designer and Builder contributions don't decay
                self.active_cs += cs_earned
        
        return {
            'username': self.username,
            'lifetime_cs': round(self.lifetime_cs, 2),
            'active_cs': round(self.active_cs, 2),
            'voting_weight': self._calculate_voting_weight(),
            'last_calculated': current_date.isoformat()
        }
    
    def _months_between(self, start_date: datetime, end_date: datetime) -> int:
        """Calculate number of months between two dates"""
        months = (end_date.year - start_date.year) * 12
        months += end_date.month - start_date.month
        return max(0, months)
    
    def _has_higher_tier_after(self, scout_date: datetime) -> bool:
        """Check if user has Designer or Builder contributions after the Scout date"""
        for contrib in self.contributions:
            contrib_date = datetime.fromisoformat(contrib['date'])
            if contrib_date > scout_date and contrib['role'] in ['designer', 'builder']:
                return True
        return False
    
    def _calculate_voting_weight(self) -> float:
        """Calculate logarithmic voting weight"""
        if self.active_cs <= 0:
            return 0.0
        return round(log10(self.active_cs), 4)


class ReputationDecayEngine:
    """Main engine for applying reputation decay across all contributors"""
    
    def __init__(self, contributors_data: List[Dict]):
        self.contributors = []
        self._parse_contributors(contributors_data)
    
    def _parse_contributors(self, data: List[Dict]):
        """Parse contributor data into ContributorScore objects"""
        for user_data in data:
            contributor = ContributorScore(
                username=user_data['username'],
                contributions=user_data.get('contributions', [])
            )
            self.contributors.append(contributor)
    
    def apply_decay(self, current_date: datetime = None) -> List[Dict]:
        """Apply decay to all contributors and return updated scores"""
        results = []
        for contributor in self.contributors:
            score_data = contributor.calculate_scores(current_date)
            results.append(score_data)
        
        # Sort by active CS (descending)
        results.sort(key=lambda x: x['active_cs'], reverse=True)
        return results
    
    def detect_point_farmers(self, threshold_ratio: float = 0.3) -> List[Dict]:
        """
        Detect potential point farmers based on Scout-heavy contribution patterns
        
        Args:
            threshold_ratio: If active_cs/lifetime_cs < threshold, flag as potential farmer
        
        Returns:
            List of flagged users with statistics
        """
        flagged = []
        
        for contributor in self.contributors:
            scores = contributor.calculate_scores()
            
            if scores['lifetime_cs'] == 0:
                continue
                
            ratio = scores['active_cs'] / scores['lifetime_cs']
            
            # Count contribution types
            scout_count = sum(1 for c in contributor.contributions if c['role'] == 'scout')
            total_count = len(contributor.contributions)
            
            if ratio < threshold_ratio and scout_count / max(total_count, 1) > 0.8:
                flagged.append({
                    'username': scores['username'],
                    'active_ratio': round(ratio, 3),
                    'scout_percentage': round(scout_count / total_count * 100, 1),
                    'total_contributions': total_count,
                    'active_cs': scores['active_cs'],
                    'lifetime_cs': scores['lifetime_cs']
                })
        
        return flagged


def run_simulation():
    """Run a 3-month simulation as described in the spark"""
    print("🔬 Running Reputation Decay Simulation (3 months)...\n")
    
    # Sample data mimicking real contribution patterns
    sample_data = [
        {
            "username": "@IntuitionIvan",
            "contributions": [
                {"date": "2025-11-15", "role": "scout", "cs": 5},
                {"date": "2025-12-01", "role": "scout", "cs": 5},
                {"date": "2026-01-10", "role": "designer", "cs": 15}  # Higher-tier saves decay
            ]
        },
        {
            "username": "@PointFarmer01",
            "contributions": [
                {"date": "2025-11-01", "role": "scout", "cs": 5},
                {"date": "2025-11-05", "role": "scout", "cs": 5},
                {"date": "2025-11-10", "role": "scout", "cs": 5},
                {"date": "2025-11-15", "role": "scout", "cs": 5},
                {"date": "2025-11-20", "role": "scout", "cs": 5}
                # No higher-tier contributions - decay applies
            ]
        },
        {
            "username": "@DevDevon",
            "contributions": [
                {"date": "2025-12-01", "role": "builder", "cs": 25},
                {"date": "2026-01-15", "role": "builder", "cs": 35}  # +10 Stability Audit
            ]
        },
        {
            "username": "@Bot-Hunter",
            "contributions": [
                {"date": "2025-11-01", "role": "scout", "cs": 5},
                {"date": "2025-11-02", "role": "scout", "cs": 5},
                {"date": "2025-11-03", "role": "scout", "cs": 5},
                {"date": "2025-11-04", "role": "scout", "cs": 5},
                {"date": "2025-11-05", "role": "scout", "cs": 5},
                {"date": "2025-11-06", "role": "scout", "cs": 5}
            ]
        },
        {
            "username": "@CreativeClara",
            "contributions": [
                {"date": "2025-12-10", "role": "designer", "cs": 20},  # +15 + 5 Echo
                {"date": "2026-01-20", "role": "scout", "cs": 5}
            ]
        }
    ]
    
    engine = ReputationDecayEngine(sample_data)
    
    # Run decay calculation
    current_date = datetime(2026, 2, 19)
    results = engine.apply_decay(current_date)
    
    print("📊 Current Reputation Scores:\n")
    print(f"{'Username':<20} {'Lifetime CS':<12} {'Active CS':<12} {'Voting Weight':<15} {'Status'}")
    print("-" * 80)
    
    for result in results:
        status = "✅ Active" if result['active_cs'] >= 20 else "⚠️  Low Influence"
        print(f"{result['username']:<20} {result['lifetime_cs']:<12} {result['active_cs']:<12.2f} {result['voting_weight']:<15} {status}")
    
    # Detect point farmers
    print("\n🚨 Point Farmer Detection:\n")
    flagged = engine.detect_point_farmers(threshold_ratio=0.4)
    
    if flagged:
        print(f"{'Username':<20} {'Active Ratio':<13} {'Scout %':<10} {'Status'}")
        print("-" * 60)
        for user in flagged:
            print(f"{user['username']:<20} {user['active_ratio']:<13} {user['scout_percentage']:<10}% {'🔴 FLAGGED'}")
    else:
        print("✅ No suspicious accounts detected")
    
    print("\n✅ Simulation Complete!")
    print("\nKey Insights:")
    print("- Scout-only contributors saw CS decay over 3 months")
    print("- Contributors with Designer/Builder work maintained full CS")
    print("- Voting weight successfully filtered low-effort participants")


def main():
    parser = argparse.ArgumentParser(
        description="Reputation Decay Script for TheCommons v2.0"
    )
    parser.add_argument(
        '--input',
        help='Path to contributors JSON file',
        type=str
    )
    parser.add_argument(
        '--output',
        help='Path to output updated CS scores',
        type=str
    )
    parser.add_argument(
        '--simulate',
        help='Run simulation mode with sample data',
        action='store_true'
    )
    
    args = parser.parse_args()
    
    if args.simulate:
        run_simulation()
    elif args.input:
        with open(args.input, 'r') as f:
            data = json.load(f)
        
        engine = ReputationDecayEngine(data)
        results = engine.apply_decay()
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(results, f, indent=2)
            print(f"✅ Updated CS scores written to {args.output}")
        else:
            print(json.dumps(results, indent=2))
    else:
        parser.print_help()


if __name__ == '__main__':
    main()

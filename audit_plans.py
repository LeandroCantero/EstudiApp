import json
import os

plans_dir = r"d:\Downloads\Documents\Unahur\Proyecto\CursApp\backend\prisma\careers"
files = [f for f in os.listdir(plans_dir) if f.endswith('.json')]

results = []

for file in files:
    try:
        with open(os.path.join(plans_dir, file), 'r', encoding='utf-8') as f:
            data = json.load(f)
            career = data.get('career', file)
            subjects = data.get('subjects', [])
            
            # Map of (year) -> [period1_count, period2_count, period0_count, total]
            year_dist = {}
            for s in subjects:
                y = s.get('year')
                p = s.get('period')
                if y not in year_dist:
                    year_dist[y] = [0, 0, 0, 0]
                
                if p == 1: year_dist[y][0] += 1
                elif p == 2: year_dist[y][1] += 1
                elif p == 0: year_dist[y][2] += 1
                year_dist[y][3] += 1
            
            unbalanced = False
            for y, dist in year_dist.items():
                if dist[0] > 0 and dist[1] == 0 and dist[3] > 1: # All P1
                    unbalanced = True
                    break
            
            if unbalanced:
                results.append((file, career, year_dist))
    except Exception as e:
        print(f"Error reading {file}: {e}")

print("AUDIT REPORT: Unbalanced Plans (All P1 in at least one year with multiple subjects)")
for file, career, dist in results:
    print(f"\n{file} ({career})")
    for y in sorted(dist.keys()):
        p1, p2, p0, total = dist[y]
        print(f"  Year {y}: P1={p1}, P2={p2}, P0={p0}, Total={total}")

import json
import os

plans_dir = r"d:\Downloads\Documents\Unahur\Proyecto\CursApp\backend\prisma\careers"
files = [f for f in os.listdir(plans_dir) if f.endswith('.json')]

for file in files:
    file_path = os.path.join(plans_dir, file)
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        subjects = data.get('subjects', [])
        if not subjects: continue
        
        # Determine total years in this career
        max_year = 0
        for s in subjects:
            y = s.get('year')
            if y and y > max_year: max_year = y
            
        # Group by year
        years = {}
        for s in subjects:
            y = s.get('year')
            if y not in years:
                years[y] = []
            years[y].append(s)
            
        changed = False
        for y in sorted(years.keys()):
            year_subjects = years[y]
            if len(year_subjects) <= 1: continue
            
            # Rule: All years EXCEPT THE LAST ONE must be balanced (P1/P2).
            # If the year is unbalanced (all P1), we force the split.
            if y < max_year:
                if all(s.get('period') == 1 for s in year_subjects):
                    # Half to P1, half to P2
                    split_at = (len(year_subjects) + 1) // 2
                    for i in range(split_at, len(year_subjects)):
                        year_subjects[i]['period'] = 2
                    changed = True
                    print(f"  Balanced Year {y} in {file} (Found {len(year_subjects)} subjects)")
            else:
                # Last year: User says exceptions are normal here.
                # We only touch it if it's strictly requested or clearly broken.
                # For now, following user instruction: "los ultimos años es cuando pueden haber o no excepciones"
                pass
        
        if changed:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Saved {file}")
            
    except Exception as e:
        print(f"Error processing {file}: {e}")

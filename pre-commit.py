import os
import re
import subprocess
from datetime import datetime
from uuid import uuid4

def get_frontmatter(filepath):
    """Extracts the frontmatter from a markdown file."""
    with open(filepath, 'r') as f:
        content = f.read()
    match = re.search(r'---\n(.*?)---\n', content, re.DOTALL)
    if match:
        return match.group(1)
    return ""

def update_frontmatter(filepath, updates):
    """Updates the frontmatter of a markdown file."""
    with open(filepath, 'r') as f:
        content = f.read()
    match = re.search(r'---\n(.*?)---\n', content, re.DOTALL)
    if match:
        frontmatter = match.group(1)
        new_frontmatter = frontmatter
        for key, value in updates.items():
            new_frontmatter = re.sub(rf'{key}:\s*.*', f'{key}: {value}', new_frontmatter)
        content = content.replace(frontmatter, new_frontmatter)
        with open(filepath, 'w') as f:
            f.write(content)

def calculate_reading_time(text):
    """Calculates the reading time of a text (simplified)."""
    words = len(text.split())
    return int(words / 200) + 1  # Assuming 200 words per minute


def main():
    try:
        result = subprocess.run(['git', 'diff', '--cached', '--name-status'], capture_output=True, text=True, check=True)
        files = [line.split()[1] for line in result.stdout.splitlines() if line.startswith('M') and line.endswith('.mdx')]

        for file in files:
            print(f"Checking {file}")
            frontmatter_str = get_frontmatter(file)
            frontmatter = {}
            for line in frontmatter_str.splitlines():
                match = re.match(r'(\w+):\s*(.*)', line)
                if match:
                    frontmatter[match.group(1)] = match.group(2).strip('"')

            if 'id' not in frontmatter:
                new_id = str(uuid4())
                print(f"Adding id to {file}")
                update_frontmatter(file, {'id': new_id})
                subprocess.run(['git', 'add', file], check=True)

            if 'draft' in frontmatter and frontmatter['draft'] == 'false':
                print(f"{file} modDateTime updated")
                update_frontmatter(file, {'modDatetime': datetime.utcnow().isoformat() + 'Z'})
                subprocess.run(['git', 'add', file], check=True)
            elif 'draft' in frontmatter and frontmatter['draft'] == 'first':
                print(f"First release of {file}, draft set to false and modDateTime removed")
                update_frontmatter(file, {'draft': 'false', 'modDatetime': ''})
                subprocess.run(['git', 'add', file], check=True)

            with open(file, 'r') as f:
                content = f.read()
            reading_time = calculate_reading_time(content)
            update_frontmatter(file, {'readingTime': reading_time})
            subprocess.run(['git', 'add', file], check=True)

        subprocess.run(['git', 'update-index', '--again'], check=True)
        subprocess.run(['bun', 'run', 'lint-staged'], check=True)

    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()

from memory import memory
import os
import re

def migrate_lessons():
    print("Starting Migration: Markdown -> Vector DB")
    
    kb_path = os.path.join(os.path.dirname(__file__), "../knowledge-base/lessons_learned.md")
    if not os.path.exists(kb_path):
        print("No legacy lessons found.")
        return

    with open(kb_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Regex to find lessons: - [DATE] LESSON: content
    # Matches: - [2024-10-10] LESSON: Don't divide by zero.
    lessons = re.findall(r"-\s*\[.*?\]\s*LESSON:\s*(.*)", content)

    print(f"Found {len(lessons)} lessons to migrate.")

    for lesson in lessons:
        lesson = lesson.strip()
        if lesson:
            print(f"   extracting: {lesson[:50]}...")
            memory.learn(lesson, source="legacy_migration")

    print("Migration Complete.")

if __name__ == "__main__":
    migrate_lessons()

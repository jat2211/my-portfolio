from app.journal_processing.journal_parser import JournalParser

def review_insights():
    parser = JournalParser()
    insights = parser.process_journal()

    if not insights:
        print("No journal content processed.")
        return

    print("\nExtracted Insights by Theme:")
    print("============================\n")

    for theme, content in insights.items():
        if content:
            print(f"\n{theme.upper()}:")
            print("-------------------")
            for insight in content:
                print(f"• {insight}")
                input("Press Enter to see next insight...")  # Review one at a time

    print("\nProcessing complete!")

if __name__ == "__main__":
    review_insights()

import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def correct_query(query):
    prompt = f"""
    Correct the spelling and grammar of the following user question.

    Rules:
    1. Fix spelling and grammar mistakes.
    2. Preserve the original meaning.
    3. Do not answer the question.
    4. Do not add extra information.
    5. Return only the corrected question.

    User question: {query}
    """

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    return response.choices[0].message.content.strip()

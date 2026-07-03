import os
from google import genai
from google.genai import types
from fastapi import HTTPException, status

class AIService:
    def __init__(self):
        # Initializes the client using the GEMINI_API_KEY env variable automatically
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is missing.")
        self.client = genai.Client()

    async def generate_chat_response(self, prompt: str, history: list) -> str:
        """
        Sends the dialogue history along with the new user prompt to Gemini.
        History format expected: [{'role': 'user'|'model', 'text': '...'}]
        """
        try:
            # Map database logs into structured Gemini Content types
            contents = []
            for msg in history:
                role = "user" if msg["sender"] == "user" else "model"
                contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=msg["content"])]
                    )
                )
            
            # Append the current fresh prompt to the context timeline
            contents.append(types.Content(role="user", parts=[types.Part.from_text(text=prompt)]))

            # Make the async call to the Gemini Flash model
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=contents,
            )
            return response.text
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI Engine Error: {str(e)}"
            )

# Instantiate a reusable singleton instance
ai_service = AIService()
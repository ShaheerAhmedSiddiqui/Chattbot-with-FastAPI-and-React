import os
from google import genai
from google.genai import types
from fastapi import HTTPException, status

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is missing.")
        
        self.client = genai.Client(api_key=self.api_key)
        print("Loaded key:", repr(self.api_key))
        
    async def generate_chat_response(self, prompt: str, history: list) -> str:
        try:
            contents = []
            for msg in history:
                sender_lower = str(msg["sender"]).lower()
                role = "user" if sender_lower == "user" else "model"
                
                contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=msg["content"])]
                    )
                )
            
            contents.append(types.Content(role="user", parts=[types.Part.from_text(text=prompt)]))

            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=contents,
            )
            return response.text
            
        except Exception as e:
            print(f"--- GEMINI API ERROR LOG --- \n{e}\n---------------------------")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI Engine Error: {str(e)}"
            )

ai_service = AIService()
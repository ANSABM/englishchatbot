import os
import openai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def initialize_openai():
    """Initialize OpenAI client with API key from environment variable"""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not found.")
        print("Please set your OpenAI API key in the environment or .env file.")
        exit(1)
    
    # Initialize OpenAI client
    openai.api_key = api_key
    return openai

def get_bot_response(messages):
    """Get response from OpenAI API"""
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",  # Using gpt-4o-mini as specified
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error communicating with OpenAI: {str(e)}"

def main():
    """Main chatbot function"""
    # Initialize OpenAI
    client = initialize_openai()
    
    # System message to ensure English-only conversation with good grammar
    system_message = {
        "role": "system",
        "content": "You are a helpful English conversation partner. Always respond in English with proper grammar and maintain a friendly, conversational tone. Help users practice English while having natural conversations."
    }
    
    # Initialize conversation history with system message
    conversation_history = [system_message]
    
    # Welcome message
    print("=" * 50)
    print("🤖 English Chatbot - Practice Your English!")
    print("=" * 50)
    print("Hello! I'm here to help you practice English.")
    print("We can chat about anything you'd like.")
    print("Type 'bye', 'exit', or 'quit' to end our conversation.")
    print("-" * 50)
    
    # Main conversation loop
    while True:
        # Get user input
        user_input = input("\nYou: ").strip()
        
        # Check for exit commands
        if user_input.lower() in ['bye', 'exit', 'quit']:
            print("\nBot: Goodbye! It was nice chatting with you. Keep practicing your English! 👋")
            break
        
        # Skip empty inputs
        if not user_input:
            continue
        
        # Add user message to conversation history
        conversation_history.append({
            "role": "user",
            "content": user_input
        })
        
        # Get bot response
        print("\nBot: ", end="", flush=True)
        bot_response = get_bot_response(conversation_history)
        print(bot_response)
        
        # Add bot response to conversation history
        conversation_history.append({
            "role": "assistant",
            "content": bot_response
        })
        
        # Keep conversation history manageable (last 20 messages + system message)
        if len(conversation_history) > 21:
            conversation_history = [system_message] + conversation_history[-20:]

if __name__ == "__main__":
    main()

import os
from fastrtc import (ReplyOnPause, Stream, get_stt_model, get_tts_model)
from groq import Groq
import dotenv
dotenv.load_dotenv()
 
# Initialize STT and TTS models

stt_model = get_stt_model()
tts_model = get_tts_model()

#Sections. 1 for active, 0 for inactive, -1 for completed
first_section= 1
second_section=0
third_section=0
fourth_section=0
fifth_section=0

# Exit section is a counter to track how many times the user has failed to provide a satisfactory answer in each section, if it reaches 4, we move to the next section.
exit_section=0
first_section_message= "**IMPORTANT: you are not allowed to make placeholders for anything, if you are not provided with information, do not mention it.**The user is initiating a conversation. Respond by welcoming him to the interview in a professional manner, introduce yourself as Alice, the HR manager and begin by asking his name."

#LLM client setup
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

#Call to LLM
def gemini_call(prompt):
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=250,
        )

        # Try primary text field
        if response.choices and response.choices[0].message.content:
            return response.choices[0].message.content.strip()

        print("Groq returned empty response")
        return "dismiss"

    except Exception as e:
        print(f"Groq API error: {e}")
        return "dismiss"

# TTS streaming function
def speak(text):
    for audio_chunk in tts_model.stream_tts_sync(text):
        yield audio_chunk

#The big boy function
def echo(audio):
    #Declarations

    global first_section, second_section, third_section, fourth_section, fifth_section, first_section_message, exit_section
    
    #section decider

    if(first_section == -1 and second_section==0 ):
        second_section = 1
    elif(second_section == -1 and third_section==0 ):
        third_section = 1
    elif( third_section == -1 and fourth_section==0 ):
        fourth_section = 1
    elif( fourth_section == -1 and fifth_section==0 ):
        fifth_section = 1

    #Interview questions flow

    reply = stt_model.stt(audio)
    print(reply) 
    if( first_section == 1 ):
        print("In first section")
        prompt = first_section_message
        first_section = -1
        question=gemini_call(prompt)
        yield from speak(question)

    elif( second_section == 1 ):
        print("In second section")
        if( exit_section + 1 == 4 ):
            exit_section=0
            second_section = -1
            yield from speak("Since you are unable to provide your name, we will proceed with the interview.")
            interrupted_message= "The user has refused to provide a name or has given an unrealistic name. Proceed to introduce to him a behavioral question."
            response=gemini_call(interrupted_message)
            print("Gemini says:", response)
            yield from speak(response)
        else:
            reply=stt_model.stt(audio)
            second_section_message= f"The user responded: {reply}. If that was his name or if the user has refused to provide a name, greet them then proceed to introduce to him a behavioral question in the format 1,question. If the user gave an unrealistic name, politely ask him again for his name in the format 0,question. Only that format, no additional text."
            response=gemini_call(second_section_message)
            print("Gemini says:", response)
            flag=response[0]
            question=response[2:]
            if( flag=='1'):
                exit_section=0
                second_section= -1
                yield from speak(question)
            else:
                exit_section+=1
                yield from speak(question)
    elif( third_section == 1):
        print("In third section")
        if( exit_section + 1 == 4 ):
            exit_section=0
            third_section= - 1
            yield from speak("That will be enough for this question. Let's proceed to the next question.")
            interrupted_message= "The user has been unable to provide a complete answer to the behavioral question. Proceed to introduce to him a technical question."
            response=gemini_call(interrupted_message)
            print("Gemini says:", response)
            yield from speak(response)
            
        else:
            reply=stt_model.stt(audio)
            third_section_message= f"The user responded: {reply}. If that was a complete answer to the question related to the behavioral question, or if the user showed in any way that he has no answer, proceed to give him a technical question in the format 1,question. If you feel it was an incomplete answer, give the user a follow-up question in the format 0,question. Only that format, no additional text."
            response=gemini_call(third_section_message)
            print("Gemini says:", response)
            flag=response[0]
            question=response[2:]
            if( flag=='1'):
                exit_section=0
                third_section= -1
                yield from speak(question)
            else:
                exit_section+=1
                yield from speak(question)
    elif( fourth_section == 1):
        print("In fourth section")
        if( exit_section + 1 == 4 ):
            exit_section=0
            fourth_section= - 1
            yield from speak("That will be enough for this question. Let's proceed to the final question.")
            interrupted_message= "The user has been unable to provide a complete answer to the technical question. Proceed to introduce to him to a problem-based / scenario-based question."
            response=gemini_call(interrupted_message)
            print("Gemini says:", response)
            yield from speak(response)
        else:
            reply=stt_model.stt(audio)
            fourth_section_message= f"The user responded: {reply}. If that was a complete answer to the question related to the technical question, or if the user showed in any way that he has no answer, proceed to give him a problem-based / scenario-based question in the format 1,question. If you feel it was an incomplete answer, give the user a follow-up question in the format 0,question. Only that format, no additional text."
            response=gemini_call(fourth_section_message)
            print("Gemini says:", response)
            flag=response[0]
            question=response[2:]
            if( flag=='1'):
                exit_section=0
                fourth_section= -1
                yield from speak(question)
            else:
                exit_section+=1
                yield from speak(question)
    elif( fifth_section == 1):
        print("In final section")
        if( exit_section + 1 == 4 ):
            exit_section=0
            fifth_section= - 1
            yield from speak("Thank you for your time. We will get back to you soon. Goodbye!")
        else:
            reply=stt_model.stt(audio)
            fifth_section_message= f"The user responded: {reply}. If that was a complete answer to the problem-based / scenario-based question, or if the user showed in any way that he has no answer, proceed to thank the user and end the interview. If you feel it was an incomplete answer, give the user a follow-up question in the format 0,question. Only that format, no additional text."
            response=gemini_call(fifth_section_message)
            print("Gemini says:", response)
            flag=response[0]
            question=response[2:]
            if( flag=='1'):
                exit_section=0
                fifth_section= -1
                yield from speak(question)
            else:
                exit_section+=1
                yield from speak(question)
    


stream = Stream(ReplyOnPause(echo), modality="audio", mode="send-receive")

stream.ui.launch()

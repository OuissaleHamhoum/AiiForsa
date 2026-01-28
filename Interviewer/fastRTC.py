import os
from fastrtc import (ReplyOnPause, Stream, AlgoOptions, SileroVadOptions, get_stt_model, get_tts_model)
from groq import Groq
import dotenv
dotenv.load_dotenv()
import json
import gradio as gr
print(gr.__version__)



# Initialize STT and TTS models

stt_model = get_stt_model()
tts_model = get_tts_model()

#Sections. 1 for active, 0 for inactive, -1 for completed
pre_intro_section= 1
intro_section=0
hr_section=0
behavioural_section=0
technical_section=0
situational_section=0

# Report
report_file = os.path.join(os.path.dirname(__file__), "report_interview.json")
# history storage
history_file = os.path.join(os.path.dirname(__file__), "conversation_history.json")
#CV and Job description paths
cv_file = os.path.join(os.path.dirname(__file__), "cv.json")
job_desc_file = os.path.join(os.path.dirname(__file__), "job_description.json")


# JSON utility functions

def load_json(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Failed loading JSON from {file_path}: {e}")
        return {}
def clear_json(file_path):
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump([], f)
    except Exception as e:
        print("Failed clearing history:", e)

def save_json(data, file_path):
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("Failed saving history:", e)

def add_history(section, role, content):
    entry = {"section": section ,"role": role, "content": content}
    history.append(entry)
    save_json(history, history_file)

def add_report(entry):
    report = load_json(report_file)
    if isinstance(entry, list):
        report.extend(entry)
    else:
        report.append(entry)
    save_json(report, report_file)


# load existing files at startup
clear_json(history_file)
clear_json(report_file)
history = load_json(history_file)
cv_text= json.dumps( load_json(cv_file), ensure_ascii=False, indent=2)
job_desc_text= json.dumps( load_json(job_desc_file), ensure_ascii=False, indent=2)

def evaluate(history):
    evaluation_prompt = (
    f"Based on the following conversation history, evaluate the candidate's performance in the interview. "
    f"Provide feedback on strengths and areas for improvement for each section, as well as the score in valid JSON format only. "
    f"The JSON should look like this example:\n\n"
    f"[{{\"section\": \"section_name\", \"score\": \"x/100\", \"strength\": \"\", \"weaknesses\": \"\", \"general overview\": \"\"}}]\n\n"
    f"Conversation History:\n" + json.dumps(history, ensure_ascii=False, indent=2)
    )

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": evaluation_prompt}],
            max_tokens=500,
        )

        if response.choices and response.choices[0].message.content:
            evaluation = response.choices[0].message.content.strip()
            try:
                clean_eval = evaluation.replace('```json', '').replace('```', '').strip()
                evaluation_json = json.loads(clean_eval)
                return evaluation_json
            except json.JSONDecodeError as e:
                print(f"Failed to parse evaluation as JSON: {e}")
                return {"error": "Invalid evaluation format"}

        print("Groq returned empty evaluation response")
        return {"error": "No evaluation available"}

    except Exception as e:
        print(f"Groq API error during evaluation: {e}")
        return {"error": f"Evaluation failed: {str(e)}"}



# Exit section is a counter to track how many times the user has failed to provide a satisfactory answer in each section, if it reaches 4, we move to the next section.
exit_section=0
pre_intro_section_message= "**ALWAYS ANSWER IN THE FORMAT 0,YOUR_ANSWER OR 1,YOUR_ANSWER, ALWAYS A BINARY DIGIT IN THE BEGINNING OF YOUR RESPONSE, make your responses short and do not ask the user for any code. You are not allowed to make placeholders for anything, if you are not provided with information, do not mention it. You also need to focus on the interview and not indulge the user in any other topic. You will be provided with a conversation history where you will be able to remember progress** The user is initiating a conversation. Respond by welcoming him to the interview in a professional manner, introduce yourself as Alice, the HR manager and begin by asking his name."

#LLM client setup
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

#Call to LLM
def groq_call(section, prompt ,R):
    print(f"User said: {R} ") 
    complete_prompt = f"Job Description:\n{job_desc_text}\nCandidate CV:\n{cv_text}\nInstruction:\nAlways make your questions meet the job description criteria and make harder questions on the skills mentioned in the CV.\nHistory of the conversation:\n{json.dumps(history, ensure_ascii=False, indent=2)}\n Next task: \n{prompt}"
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": complete_prompt}],
            max_tokens=250,
        )

        if response.choices and response.choices[0].message.content:
            Q = response.choices[0].message.content.strip()
            print(f"Groq said: {Q} ")
            # persist the current user prompt + assistant reply into history (R)
            add_history(section, "User said", R)
            add_history(section, "You said", Q[2:])

            return Q

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
    reply = stt_model.stt(audio)
    if reply=="":
        speak("I didn't catch that. Could you please repeat?")
        return
    else:
        #Declarations
        global pre_intro_section, intro_section, hr_section , behavioural_section, technical_section, situational_section, pre_intro_section_message, exit_section
        
        #section decider

        if(pre_intro_section == -1 and intro_section==0 ):
            intro_section = 1
        elif(intro_section == -1 and hr_section ==0 ):
            hr_section = 1
        elif( hr_section == -1 and behavioural_section==0 ):
            behavioural_section = 1
        elif( behavioural_section == -1 and technical_section==0 ):
            technical_section = 1
        elif( technical_section == -1 and situational_section==0 ):
            situational_section = 1

        #Interview questions flow

        

        if( pre_intro_section == 1 ):
            prompt = pre_intro_section_message
            pre_intro_section = -1

            question = groq_call("Pre-Introduction Section",prompt,reply)

            yield from speak(question[2:])

        elif( intro_section == 1 ):
            if( exit_section + 1 == 4 ):
                exit_section = 0
                intro_section = -1
                interrupted_message= "The user has refused to provide a name or has given an unrealistic name. Greet them then proceed to introduce to him a behavioral question."
                response=groq_call("Introduction Section",interrupted_message,reply)
                yield from speak(response)
            else:
                intro_section_message=f"The user responded: {reply}. Classify the user's latest message: if it contains a realistic human name or refuses to give a name, greet and introduce them to an hr question in the format 1,question; if it contains a ridiculous/unrealistic name or no valid name, give them a follow-up question in the format 0,question. Always output only 0,question or 1,question with no extra text, and treat insults or irrelevant replies as invalid names. If the user refuses to give a name, proceed to ask them the HR question directly."
                response=groq_call("Introduction Section",intro_section_message,reply)
                flag=response[0]
                question=response[2:]
                if( flag=='1'):
                    exit_section = 0
                    intro_section= -1
                    yield from speak(question)
                else:
                    exit_section += 1
                    yield from speak(question)
        elif ( hr_section == 1):
            if( exit_section + 1 == 4 ):
                exit_section = 0
                hr_section= -1
                interrupted_message= "The user has been unable to provide a complete answer to the HR question. Proceed to introduce to him a behavioural question."
                response=groq_call("HR Section",interrupted_message,reply)
                yield from speak(response)
                
            else:
                hr_section_message= f"The user responded: {reply}. If that was a complete answer to the question related to the HR question, or if the user showed in any way that he has no answer, proceed to give him a technical question in the format 1,question. If you feel it was an incomplete answer, give the user a follow-up question in the format 0,question. Only that format, no additional text."
                response=groq_call("HR Section",hr_section_message,reply)
                flag=response[0]
                question=response[2:]
                if( flag=='1'):
                    exit_section=0
                    hr_section= -1
                    yield from speak(question)
                else:
                    exit_section+=1
                    yield from speak(question)
        elif( behavioural_section == 1):
            if( exit_section + 1 == 4 ):
                exit_section = 0
                behavioural_section= -1
                interrupted_message= "The user has been unable to provide a complete answer to the behavioral question. Proceed to introduce to him a technical question."
                response=groq_call("Behavioural Section",interrupted_message,reply)
                yield from speak(response)
                
            else:
                behavioural_section_message= f"The user responded: {reply}. If that was a complete answer to the question related to the behavioral question, or if the user showed in any way that he has no answer, proceed to give him a technical question in the format 1,question. If you feel it was an incomplete answer, give the user a follow-up question in the format 0,question. Only that format, no additional text."
                response=groq_call("Behavioural Section",behavioural_section_message,reply)
                flag=response[0]
                question=response[2:]
                if( flag=='1'):
                    exit_section=0
                    behavioural_section= -1
                    yield from speak(question)
                else:
                    exit_section+=1
                    yield from speak(question)
        elif( technical_section == 1):
            if( exit_section + 1 == 4 ):
                exit_section=0
                technical_section= -1
                interrupted_message= "The user has been unable to provide a complete answer to the technical question. Proceed to introduce to him to a problem-based / scenario-based question."
                response=groq_call("Technical Section",interrupted_message,reply)
                yield from speak(response)
            else:
                technical_section_message= f"The user responded: {reply}. If that was a complete answer to the question related to the technical question, or if the user showed in any way that he has no answer, proceed to give him a problem-based / scenario-based question in the format 1,question. If you feel it was an incomplete answer, give the user a follow-up question in the format 0,question. Only that format, no additional text."
                response=groq_call("Technical Section",technical_section_message,reply)
                flag=response[0]
                question=response[2:]
                if( flag=='1'):
                    exit_section=0
                    technical_section= -1
                    yield from speak(question)
                else:
                    exit_section+=1
                    yield from speak(question)
        elif( situational_section == 1):
            if( exit_section + 1 == 4 ):
                exit_section = 0
                situational_section= -1
                yield from speak("Thank you for your time. We will get back to you soon. Goodbye!")
                print("Interview completed. Generating evaluation report...")
                evaluation_result = evaluate(history)
                if "error" not in evaluation_result:
                    add_report(evaluation_result)
                    print("Evaluation report generated and saved successfully")
                else:
                    print(f"Failed to generate evaluation: {evaluation_result['error']}")

            else:
                situational_section_message= f"The user responded: {reply}. If that was a complete answer to the problem-based / scenario-based question, or if the user showed in any way that he has no answer, proceed to thank the user and end the interview. If you feel it was an incomplete answer, give the user a follow-up question in the format 0,question. Only that format, no additional text."
                response=groq_call("Situational Section",situational_section_message,reply)
                flag=response[0]
                question=response[2:]
                if( flag=='1'):
                    exit_section=0
                    situational_section= -1
                    yield from speak(question)
                    print("Interview completed. Generating evaluation report...")
                    evaluation_result = evaluate(history)
                    if "error" not in evaluation_result:
                        add_report(evaluation_result)
                        print("Evaluation report generated and saved successfully")
                    else:
                        print(f"Failed to generate evaluation: {evaluation_result['error']}")
                else:
                    exit_section += 1
                    yield from speak(question)


stream = Stream(ReplyOnPause(echo,
        algo_options=AlgoOptions(
            audio_chunk_duration=1.5,
            started_talking_threshold=0.2,
            speech_threshold=0.1
        ),
        can_interrupt=False,
        model_options=SileroVadOptions(
            threshold=0.5,
            min_speech_duration_ms=250,
            min_silence_duration_ms=2000
        )), modality="audio", mode="send-receive")

# custom CSS to hide watermarks
css = """
header, footer, .gradio-container header, .gradio-container footer, .svelte-drumkq {
    display: none !important;
}
"""

# create a clean wrapper UI
with gr.Blocks(css=css, theme=None) as app:
    gr.Markdown("")  # optional placeholder
    stream.ui.render()  # embed your existing stream UI

app.launch(show_api=False, share=False)



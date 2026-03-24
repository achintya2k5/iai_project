from test_prompt import prompt_runner

#Empty prompt runner
INVALID_EMPTY={
    "score": None,
    "category": "invalid_input",
    "explanation": "Empty input given.",
    "tip": "Please give a claim/statement to fact-check",
    "flags": ["empty input"]
}

#Too short prompt error
INVALID_SHORT={
    "score": None,
    "category": "short_input",
    "explanation": "Given input is too short",
    "tip": "Enter a longer claim",
    "flags": ["too short"]
}

#Too long prompt error
INVALID_LONG={
    "score": None,
    "category": "long_input",
    "explanation": "Given input is too long",
    "tip": "Enter a shorter claim",
    "flags": ["too long"]
}

#Logic to check input
def input_checker(input):
    if not input.strip():
        return INVALID_EMPTY
    if len(input.strip())<5:
        return INVALID_SHORT
    if len(input.strip())>250:
        return INVALID_LONG
    return input.strip()

#Run app
if __name__=="__main__":
    inp=input(str("Enter your desired prompt: "))
    valid_input=input_checker(inp)
    if isinstance(valid_input,dict):
        print(valid_input)
    else:
        result=prompt_runner(inp)
        print(result)
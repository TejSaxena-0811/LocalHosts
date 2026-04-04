import os
from openai import AzureOpenAI
from dotenv import load_dotenv
load_dotenv()
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),  
    api_version="2024-02-01",
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    )

deployment_name=os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME')

# function to read the content of a file
def read_file_content(filename):
    with open(filename, 'r') as file:
        content = file.read()
    return content

# function to read file, process context, and handle prompts
def augur(product_info, product_diagram, prompts_file, max_tokens=4000):
    context=""
    aithreats=""
    # read prompts from the prompts file--
    with open(prompts_file, 'r') as file:
        prompts = file.readlines()
        for i,prompt in enumerate(prompts):
            response = client.chat.completions.create(
                model=deployment_name,
                messages=[
                    {"role": "user", "content": product_info},
                    {"role": "user", "content": product_diagram},
                    {"role": "system", "content": prompt}
                ],
                max_tokens=max_tokens
            )
            print(response.choices[0].message.content)
            if i < len(prompts) - 1:
                context += response.choices[0].message.content
            else:
                aithreats = response.choices[0].message.content
    
    return context, aithreats
    


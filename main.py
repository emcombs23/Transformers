from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
import re
import torch
import torch.nn as nn

app = FastAPI()

vocab = [" ", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
vocabDict = {}
count = 0
for char in vocab:
    vocabDict[char] = count
    count +=1
print(vocabDict)

def clean_string(string):
    string = string.lower()
    cleanString = ""
    for char in string:
        if char in vocabDict:
            cleanString += char
        else:
            cleanString += " "
    newText = re.sub(r'\s+', ' ', cleanString)
    return newText

print(clean_string("Hello, World!x"))

embedding = nn.Embedding(27,2)



@app.get("/vocab")
def get_chars():
    return vocabDict

@app.get("/encode")
def encode_string(string: str):
    string = string.lower()
    clean = clean_string(string)
    encodeList = []
    for char in clean:
        encodeList.append(vocabDict[char])
    return encodeList

@app.get("/embed")
def embed_string():
    result = {}
    for i in range(27):
        vector = embedding.weight[i]
        result[i] = vector.tolist()
    return result

app.mount("/", StaticFiles(directory="static", html=True), name="static")
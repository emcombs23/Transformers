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

@app.get("/dict")
def get_chars():
    return vocabDict

app.mount("/", StaticFiles(directory="static", html=True), name="static")
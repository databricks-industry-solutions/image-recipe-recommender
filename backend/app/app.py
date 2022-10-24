from fastapi import FastAPI
import json
import numpy as np 
from PIL import Image
from io import BytesIO
import os
import pandas as pd
from decouple import config
import pickle
import base64
import requests
import ast 
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import io
import uvicorn
import os



app = FastAPI()

#Change this to point to the github pages url where the frontend is deployed to
origins = [
    #"http://localhost:3000",
    "https://avisoori-databricks.github.io",
    'https://avisoori-databricks.github.io/databricksrecipeai'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

samples_bs64 = pickle.load(open('./samples_bs64.pkl', 'rb'))['samples_bs64']



token = os.environ['DATABRICKS_TOKEN']

def create_tf_serving_json(data):
  return {'inputs': {name: data[name].tolist() for name in data.keys()} if isinstance(data, dict) else data.tolist()}


def score_model(dataset_pd):
  
  # assign url and headers
  url = 'https://adb-2704554918254528.8.azuredatabricks.net/model-endpoint/recipe_model/Production/invocations'
  headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
  
  # assemble payload as expected by webservice
  ds_dict = {'dataframe_split': dataset_pd.to_dict(orient='split')}
  
  data_json = json.dumps(ds_dict, allow_nan=True)
  response = requests.request(method='POST', headers=headers, url=url, data=data_json)
  
  if response.status_code != 200:
     raise Exception(f'Request failed with status {response.status_code}, {response.text}')
  return response.json()



def results_process(results):
  images_bs64 = []
  recipes = []
  #for key in results[0]:
  obj_list = ast.literal_eval(results[0]['0'])
  print(len(obj_list))
  for obj in obj_list:
    images_bs64.append(obj["encoded_image"])
    recipe_dict = {}
    recipe_dict["Title"] = obj["title"]
    recipe_dict["Cleaned_Ingredients"] = obj["ingredients"]
    recipe_dict["Instructions"] = obj["instructions"]
    recipes.append(recipe_dict)

  result_dict = {"predictions":{"recipes":recipes, "images_bs64":images_bs64}}
  return json.dumps(result_dict)
    


@app.get("/image_text/{image_string}")
async def get_similar_text(image_string):

    payload_pd = pd.DataFrame([[image_string, 3]],columns=['search','k'])

    results = score_model(payload_pd)['predictions']
    processed_results = results_process(results)


    return {'result': processed_results}


@app.get("/random_images")
async def get_random_images():
  rand_nums = np.random.randint(1,200,5).tolist()
  result_dict = {}
  
  for i in range(5):

    result_dict[i] = samples_bs64[rand_nums[i]]

  result_dict['5'] = rand_nums
  print(rand_nums)
  print(type(rand_nums))
  return result_dict



@app.post("/file_url/uploadfile/")
async def create_upload_file(file: UploadFile):
    request_object_content = await file.read()
    img = Image.open(io.BytesIO(request_object_content)).convert("RGB")
    #results  = type(img)
    extension = file.filename.split('.')[-1]
    if extension=="jpg" or extension=="JPG":
        extension = "JPEG"
    
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    payload_pd = pd.DataFrame([[img_str, 3]],columns=['search','k'])

    results = score_model(payload_pd)['predictions']
    processed_results = results_process(results)


    return {'result': processed_results}



@app.get("/random_image_index/{image_int}")
async def get_similar_for_random(image_int):
    
    payload_pd = pd.DataFrame([[samples_bs64[int(image_int)], 3]],columns=['search','k'])

    results = score_model(payload_pd)['predictions']
    processed_results = results_process(results)


    return {'result': processed_results}


<img src='https://github.com/databricks-industry-solutions/.github/raw/main/profile/solacc_logo_wide.png' width="600px">

[![DBR](https://img.shields.io/badge/DBR-10.4ML-red?logo=databricks&style=for-the-badge)](https://docs.databricks.com/release-notes/runtime/10.4ml.html)
[![CLOUD](https://img.shields.io/badge/CLOUD-ALL-blue?logo=googlecloud&style=for-the-badge)](https://cloud.google.com/databricks)
[![POC](https://img.shields.io/badge/POC-10_days-green?style=for-the-badge)](https://databricks.com/try-databricks)

Developers are increasingly looking to integrate Machine Learning and AI capabilities into their applications. With this application, our goal is to illustrate how developers from very different disciplines can collaborate to bring forward some exciting functionality for their shared users. Using a publicly available dataset and pre-trained models, we deploy our data and model assets behind an easy to consumer REST API.

As illustrated in the architectural diagram below, the application consists of a simple React JavaScript UI coupled to a model deployed through Databricks model serving. The UI code is available in the following repo folders:

* **frontend**: the Reach JS code for the UI
* **backend**: the sample images used to populate the random samples displayed in the UI and the FastAPI service for the backend logic (including wrapper functions for model inference calls to the Databricks Serverless Real-Time Inference model endpoint)

The model employed here is CLIP (specifically openai/clip-vit-base-patch32 from the HuggingFace Hub). The way the model and the index is employed in this example allows similarity search over an index of image embeddings either using text or image inputs. 

The Databricks components are available as three notebooks in the **model_and_data_prep** folder.  These notebooks process the images and recipe data associated with the application and package these assets with the model for deployment to Databricks model serving.
</p>

___

<img src=https://brysmiwasb.blob.core.windows.net/demos/images/recipes_simplearch.png width=600>

___

&copy; 2022 Databricks, Inc. All rights reserved. The source in this notebook is provided subject to the [Databricks License](https://databricks.com/db-license-source).  All included or referenced third party libraries are subject to the licenses set forth below.

| library                                | description             | license    | source                                              |
|----------------------------------------|-------------------------|------------|-----------------------------------------------------|
|sentence-transformers | Provides an easy method to compute dense vector representations for sentences, paragraphs, and images | Apache 2.0| https://pypi.org/project/sentence-transformers/      |
| kaggle| Official API for `https://www.kaggle.com`, accessible using a command line tool implemented in Python | Apache 2.0 | https://pypi.org/project/kaggle/|

import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Accordion from 'react-bootstrap/Accordion';
import { jsPDF } from "jspdf";
import Uploader from './Uploader.js'
import Alert from 'react-bootstrap/Alert';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';



export default function App() {
  const [images_bs64, setImages_bs64] = React.useState([]);
  //This is for the random images, each state variable is an array with 5 elements
  const [randomize_results, setRandomize_results] = React.useState({});
  const [recipes, setRecipes] = React.useState([]);
  const [textinput, setTextInput] = React.useState({});
  const [textinputRandomize, setTextInputRandomize] = React.useState({});
  const [UploadDetails, setUploadDetails] = useState([]);
  const [files, setFiles] = useState([]);
  const [randomize, setRandomize] = useState(false);
  //This decides to render the recommendations or not
  const [show, setShow] = useState(false);
  //When this is true, a border will appear around the clicked radom image, when false, it will disappear 
  const [randomClicked, setRandomClicked] = useState(false);
  //Tracking the randominzed clicked div
  const [randomClickedDiv, setRandomClickedDiv] = useState({});

  const backend_url = "https://databricksrecipefinder.azurewebsites.net";
  //const backend_url = "http://127.0.0.1:8000";

  //A function to clean borders of randomly selected images
  const cleanBorders = () => {

    const imageDivs = ['0', '1', '2', '3', '4', '5'];
    imageDivs.map(
      x => document.getElementById(x).style.border = 'none'
    );

  }

  function is_numeric(str) {
    return /^\d+$/.test(str);
  }

  //Function to generate recipe pdf for each recipe recommended by the recommendation engine
  const generatePdf = (index, recipes, images_bs64) => {
    const doc = new jsPDF();
    doc.text(15, 20, 'Retrieved by the Databricks AI Recipe Finder');

    doc.text(15, 30, `Recipe: ${recipes[index].Title}`);
    doc.setFontSize(11);

    const imgData = `data:image/jpeg;base64,${images_bs64[index]}`;
    //const splitIngredients = doc.splitTextToSize(eval(`new Array(${recipes[index].Cleaned_Ingredients.replace(/^\[|\]$/g, '')})`).join(' ,'), 180);
    const splitIngredients = eval(`new Array(${recipes[index].Cleaned_Ingredients.replace(/^\[|\]$/g, '')})`);

    //
    let truncatedIngredients = [];
    for (let i = 0; i < splitIngredients.length; i++) {
      truncatedIngredients[i] = doc.splitTextToSize(splitIngredients[i], 170);

    }
    //Ingredients ready to be rendered
    const renderIngredients = truncatedIngredients.flat(1);

    //

    doc.text(15, 90, 'Ingredients:');
    doc.addImage(imgData, 'JPEG', 15, 40)
    //split ingredient list on commas 

    let yloc = 100;

    for (let i = 0; i < renderIngredients.length; i++) {
      doc.text(15, yloc, renderIngredients[i]);
      yloc += 5;
    }
    doc.addPage();

    //const splitInstructions = doc.splitTextToSize(recipes[index].Instructions, 180);
    //console.log(splitInstructions);
    doc.text(15, 30, 'Instructions:');
    const InstructionsArray = recipes[index].Instructions.split("\\n");

    //Add a space between each linebreak as rendered in the pdf
    let spacedInstructions = [];
    let spaced_pos = 0;
    for (let i = 0; i < InstructionsArray.length; i++) {
      spacedInstructions[spaced_pos] = InstructionsArray[i];
      spaced_pos = ++spaced_pos;
      spacedInstructions[spaced_pos] = ' ';
      spaced_pos = ++spaced_pos;
    }


    let splitInstructions = [];
    for (let i = 0; i < spacedInstructions.length; i++) {
      splitInstructions[i] = doc.splitTextToSize(spacedInstructions[i], 170);

    }
    const cleanedInstructions = splitInstructions.flat(1);

    yloc = 40;


    for (let i = 0; i < cleanedInstructions.length; i++) {
      if (i % 50 === 0 && i !== 0) {
        yloc = 40;
        doc.addPage();
      }
      doc.text(15, yloc, cleanedInstructions[i]);
      yloc += 4;

    }
    //Do something to have the solo number elements concatted to the next item
    //Remove leading closing parentheses

    //doc.text(20, 40, splitInstructions);
    doc.save(`${recipes[index].Title} Recipe.pdf`);

  }

  //Function to assign text input to a state variable and trigger the clear borders around any clicked images
  const setInput = () => {
    if (document.getElementById("input").value.length > 0 && document.getElementById("input").value.length < 300) {
      setTextInput(document.getElementById("input").value);
      clickTextInputRandomize();
      document.getElementById('prevTerm').innerText = 'Most recent search term : ' + document.getElementById("input").value;
      document.getElementById('input').value = '';
      setRandomClicked(false);
      setUploadDetails('');
    } else {
      document.getElementById('input').value = '';
    }
  }

  //A function to set the state variables for both recipes and bs64 encoded images
  const assignImagesRecipes = (data) => {
    setRecipes(JSON.parse(data.result).predictions.recipes);
    setImages_bs64(JSON.parse(data.result).predictions.images_bs64);
  }

  //Function to retrieve Recipes via an API call to the FastAPI service which in turn calls the Databricks Serverless Serving endpoint which serves the CLIP model and FAISS index
  const loadRecipes = (index) => {
    //  
    fetch(backend_url + '/random_image_index/' + randomize_results[5][index]).then(res => res.json()).then(data => {
      assignImagesRecipes(data);
      setShow(true);
    });
    setRandomClicked(true);
    setRandomClickedDiv(index);
    setUploadDetails('');
    document.getElementById('prevTerm').innerText = '';

  }



  React.useEffect(() => {
    fetch(backend_url + '/image_text/' + textinput).then(res => res.json()).then(data => {
      assignImagesRecipes(data);

    });
    setShow(true);



  }, [textinputRandomize])

  //This is the new code added to get some christmas specific images when the page is reloaded
  React.useEffect(() => {
    fetch(backend_url + '/image_text/' + 'turkey').then(res => res.json()).then(data => {
      assignImagesRecipes(data);
    });
    setShow(false);


  }, [])

  //Effect hook to populate sample image indices [0,200] and corresponding bs64 images. Each in an array
  React.useEffect(() => {
    fetch(backend_url + '/random_images').then(res => res.json()).then(data => {
      //console.log(data);
      setRandomize_results(data)
      setRandomClicked(false);

    })
  }, [randomize])

  //This will change the randomize state variable, when placed in onclick attribute of button
  const clickRandomize = () => {
    cleanBorders();
    setRandomize(Math.floor(Math.random() * 100));
  };

  const clickTextInputRandomize = () => {
    setTextInputRandomize(Math.floor(Math.random() * 100));
  };

  useEffect(() => {

    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, []);

  //Clean existing borders and apply border to clicked div
  useEffect(() => {
    if (randomClicked === true) {
      cleanBorders();
      document.getElementById(randomClickedDiv).style.border = '2px solid #1B3139 ';
      document.getElementById(randomClickedDiv).style.borderRadius = '10px';


    }
    else {
      cleanBorders();

    }
  })

  return (
    //Render the UI

    <div className="App">


      <div class="p-4 ml-2">
        <img class="p-2 ml-1" src={require("./header.png")} alt={"App logo"} />

        <Alert variant='secondary'>
          <p>
            Welcome to the Databricks Holiday Recipe Finder app.
            The purpose of this application is to demonstrate how AI-capabilities can be easily integrated with a user interface leveraging Databricks model serving capabilities.
            Databricks model serving, also known as the Databricks Serverless Real-Time Inference, allows developers and data scientists to deploy machine learning models to a scalable,
            easy to manage microservices layer accessible via a REST API.  This functionality is intended to make the operationalization of machine learning models easier, allowing
            organizations to deliver new experiences and capabilities to their customers.
          </p>
          <hr />
          <p>
            With this particular application, you can search the Epicurious Food Ingredients and Recipes dataset using either image-based or text-based semantic search.
            Click on any of the randomly selected images to find recipes associated with similar images or upload an image of your own.
            Use the search box below the images to search the images with text, either keywords or phrases.
          </p>
        </Alert>

        <p class="mt-3 mb-1 p-0">Please upload your own image or click on one of the randomly selected images from below </p>

        <div>

          <div class="row mt-2">

            {/*These are images */}
            <div id='0' class="col-md-2 col-xs-2 thumb">
              <a class="thumbnail" href="#">
                {randomize_results[0] && <img class="img-responsive float rounded my-1" onClick={() => loadRecipes(0)} src={`data:image/jpeg;base64,${randomize_results[0]}`} alt="" height="200" width="100%" />}
              </a>
            </div>

            <div id='1' class="col-md-2 col-xs-2 thumb">
              <a class="thumbnail" href="#">
                {randomize_results[1] && <img class="img-responsive float rounded my-1" onClick={() => loadRecipes(1)} src={`data:image/jpeg;base64,${randomize_results[1]}`} alt="" height="200" width="100%" />}
              </a>
            </div>

            <div id='2' class="col-md-2 col-xs-2 thumb">
              <a class="thumbnail" href="#">
                {randomize_results[2] && <img class="img-responsive float rounded my-1" onClick={() => loadRecipes(2)} src={`data:image/jpeg;base64,${randomize_results[2]}`} alt="" height="200" width="100%" />}
              </a>
            </div>

            <div id='3' class="col-md-2 col-xs-2 thumb">
              <a class="thumbnail" href="#">
                {randomize_results[3] && <img class="img-responsive float rounded my-1" onClick={() => loadRecipes(3)} src={`data:image/jpeg;base64,${randomize_results[3]}`} alt="" height="200" width="100%" />}
              </a>
            </div>

            <div id='4' class="col-md-2 col-xs-2 thumb">
              <a class="thumbnail" href="#">
                {randomize_results[4] && <img class="img-responsive float rounded my-1" onClick={() => loadRecipes(4)} src={`data:image/jpeg;base64,${randomize_results[4]}`} alt="" height="200" width="100%" />}
              </a>
            </div>

            <div id='5' class="col-md-2 col-xs-2 thumb float-start" data-bs-toggle="tooltip" title="Image Size Limit: 5 MB">

              <Uploader setFiles={setFiles} setUploadDetails={setUploadDetails} setRandomClicked={setRandomClicked} setRandomClickedDiv={setRandomClickedDiv} setRecipes={setRecipes} setImages_bs64={setImages_bs64} setShow={setShow} url={backend_url} />


            </div>
            {/*<div class="m-2  text-wrap"><small> {UploadDetails}</small></div>*/}

          </div>

          <div class="my-2">
            {/*Randomized images to click */}
            <button onClick={clickRandomize} aria-controls="example-collapse-text" aria-expanded='false' class="btn btn-dark btn-sm float-start" >Randomize</button>
          </div>
          <div>
            <br />


            <div class="input-group my-3 " >
              {/*Assign text input to state variable to be submitted to API for query */}
              <input autoFocus={false} type="text" onKeyPress={(e) => { if (e.key === "Enter") { { setInput() } } }} class="form-control" placeholder="Please enter the type of food you want to look up" id="input" aria-label="Recipient's username" aria-describedby="basic-addon2" />
              <div class="input-group-append" >
                <span><button onClick={setInput} class="btn btn-dark btn-m ">Search </button>
                </span>

              </div>

            </div>
            {textinput && <p id="prevTerm" ></p>}

          </div>

          <div>
            {show && images_bs64.length !== 0 && [0, 1, 2].map(index => [
              <div class="container float-left mw-100 mb-2 py-2" style={{ border: '1px inset #4C4E52 ', borderRadius: '20px' }} id="divToPrint">
                <div class="row">
                  <div class="col">
                    <img class="rounded" src={`data:image/jpeg;base64,${images_bs64[index]}`} />
                    <div >
                      {recipes[index].Title}

                    </div>
                  </div>
                  {/* Render the images  recommended */}


                  <div class="float-start m-2 col-8" >
                    <Accordion>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>Ingredients</Accordion.Header>
                        <Accordion.Body style={{ backgroundColor: '#EEEDE9' }}>
                          {eval(`new Array(${recipes[index].Cleaned_Ingredients.replace(/^\[|\]$/g, '')})`).map(ingredient => {
                            return (
                              <ul class="my-0">{ingredient}</ul>)
                          })}
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>Instructions</Accordion.Header>
                        <Accordion.Body style={{ backgroundColor: '#EEEDE9' }}>
                          {

                            recipes[index].Instructions.split("\\n").map(instruction => {
                              return (
                                <ul class="my-2">{instruction}</ul>)
                            })

                          }

                        </Accordion.Body>
                      </Accordion.Item>
                      <div class="float-end ">
                        

                        <OverlayTrigger
                          key='top'
                          placement='top'
                          trigger='hover'
                          overlay={
                            <Tooltip id={'tooltip-top'}>
                              Download this recipe as a PDF
                            </Tooltip>
                          }
                        >

                          <button onClick={() => generatePdf(index, recipes, images_bs64)} aria-controls="example-collapse-text" aria-expanded='false' class="btn btn-dark btn-sm m-2 " >Get This Recipe</button>
                        </OverlayTrigger>

                      </div>
                    </Accordion>
                  </div>
                </div>
              </div>

            ])}
          </div>
        </div>
      </div>
    </div>
  );
}

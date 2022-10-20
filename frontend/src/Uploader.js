import React, { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone'
import 'bootstrap/dist/css/bootstrap.min.css';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';


export default function Uploader({setFiles, setUploadDetails, setRandomClicked, setRandomClickedDiv,setRecipes, setImages_bs64}){
    // Styling for 
  const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box',
    justifyContent: 'center',
  };

  const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden'
  };

  const img = {
    display: 'block',
    width: 'auto',
    height: '100%'
  };

  const baseStyle = {
    flex: 1,
    height: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '55px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#4C4E52',
    outline: 'none',
    transition: 'border .24s ease-in-out'
  };

  const focusedStyle = {
    borderColor: '#2196f3'
  };

  const acceptStyle = {
    borderColor: '#00e676'
  };

  const rejectStyle = {
    borderColor: '#ff1744'
  };

  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
    const details = `Following recommendations are based on the user uploaded image: ${acceptedFiles[0].path} - ${acceptedFiles[0].size} bytes`;
    setUploadDetails(details);

    let formData = new FormData();
    document.getElementById('prevTerm').innerText = '';
    setRandomClicked(true);
    setRandomClickedDiv(5);




    formData.append('file', acceptedFiles[0])
    fetch('http://127.0.0.1:8000/file_url/uploadfile/',
      {
        method: 'POST',
        body: formData
      }
    ).then(res => res.json()).then(data => {
      setRecipes(JSON.parse(data.result).predictions.recipes);
      setImages_bs64(JSON.parse(data.result).predictions.images_bs64);

    });

  }, [])

  function StyledDropzone(props) {
    const {
      getRootProps,
      getInputProps,
      isFocused,
      isDragAccept,
      isDragActive,
      isDragReject
    } = useDropzone({
      onDrop, maxSize: 5000000, accept: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png']
      }
    });

    const style = useMemo(() => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {})
    }), [
      isFocused,
      isDragAccept,
      isDragReject
    ]);

    return (
      <div className="container">
        <div {...getRootProps({ style })}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop or select file</p>

        </div>

      </div>
    );
  }


return (

<OverlayTrigger
  key='top'
  placement='top'
  trigger='hover'
  overlay={
    <Tooltip id={'tooltip-top'}>
      Restricted to a single *.jpeg or *.png image smaller than 5 MB for each upload
    </Tooltip>
  }
>

  <a class="thumbnail my-1" href="#">
    <StyledDropzone />
  </a>
</OverlayTrigger>


);
}
